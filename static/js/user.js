var repel = function(data) {
  var buff;
  if (data.parent('li').hasClass('up')) {
    buff = '.down a';
  } else if (data.parent('li').hasClass('down')) {
    buff = '.up a';
  } else {
    return false;
  }
  var $this = data.parents('ul.vote').find(buff);
  var content = $this.html(),
      content_top = content.substr(0, content.indexOf('</i>') + 4),
      content_tail = content.substr(content.indexOf('</i>') + 5, content.length),
      count = parseInt(content.substr(content.indexOf('(') + 1, content.indexOf(')')));

  if (content.indexOf('已') !== -1) {
    $this.parent('li').removeClass('pressed');
    content_tail = content.substr(content.indexOf('已') + 1, content.length);
    content = content_top + ' ' + content_tail;
    if (count > -1) {
      count -= 1;
      content_top = content.substr(0, content.indexOf('('));
      content = content_top + "(" + count + ")";
    }
    $this.html(content);
  }
};

$(function() {
  $('.profile-action a:first').live('click', function() {
    var $this = $(this);
    var url = $this.attr('href'),
        $info_follow_area = $this.parents('.profile-head').find('.status li:last a span');
    var count = parseInt($info_follow_area.html());

    $.get(url, function(data) {
      if (data.status !== 'success') {
        noty(data);
      } else {
        $this.removeClass('onloading');
        if (data.type === 1) {
          $this.removeClass('fo').addClass('unfo');
          $this.html('已关注');
          count += 1;
        } else if (data.type === 0) {
          $this.removeClass('unfo').addClass('fo');
          $this.html('关注');
          count -= 1;
        }
        $info_follow_area.html(count);
      }
    });
    $this.addClass('onloading');
    button_content = $this.html();
    $this.html(button_content + ' ..');
    return false;
  });

  $('.vote li a').live('click', function(e) {
    e.preventDefault();
    var $this = $(this);
    var url = $this.attr('href');
    if ($this.parent('li').hasClass('edit')) {
      window.location.href = url;
      return;
    }
    var content = $this.html(),
        content_top = content.substr(0, content.indexOf('</i>') + 4),
        content_tail = content.substr(content.indexOf('</i>') + 5, content.length),
        count = parseInt(content.substr(content.indexOf('(') + 1, content.indexOf(')')));

    $.get(url, function(data) {
      if (data.status != 'success') {
        noty(data);
      } else {
        if (data.type === 1) {
          $this.parent('li').removeClass('pressed').addClass('pressed');
          content = content_top + ' 已' + content_tail;
          if (count > -1) {
            count += 1;
            content_top = content.substr(0, content.indexOf('('));
            content = content_top + '(' + count + ')';
          }
          $this.html(content);
          repel($this);
        } else if (data.type === 0) {
          $this.parent('li').removeClass('pressed');
          content_tail = content.substr(content.indexOf('已') + 1, content.length);
          content = content_top + ' ' + content_tail;
          if (count > -1) {
            count -= 1;
            if (data.category === 'up') {
              content = content_top + ' 赞同(' + count + ')';
            } else if (data.category === 'down') {
              content = content_top + ' 反对(' + count + ')';
            }
          }
          $this.html(content);
        }
      }
    });
  });

  $('.profile-action .mail').live('click', function(e) {
    e.preventDefault();
    var action = $(this).attr('href');

    layout =
      '<div id="layout" class="message">'
    +   '<div class="layout-header">'
    +     '<div class="title">'
    +       '发送私信'
    +     '</div>'
    +     '<a title="关闭" class="layout-close">'
    +       '<i class="icon-remove"></i>'
    +     '</a>'
    +   '</div>'
    +   '<div class="layout-content">'
    +      '<form action="' + action + '" method="post">'
    +        '<input type="hidden" name="_xsrf" value="' + get_cookie('_xsrf') + '">'
    +        '<div class="fm-row">'
    +          '<div class="fm-item">'
    +            '<textarea name="content"></textarea>'
    +          '</div>'
    +        '</div>'
    +        '<div class="fm-action">'
    +          '<button type="submit" class="btn">发送</button>'
    +        '</div>'
    +      '</form>'
    +   '</div>'
    + '</div>';

    $('#layout').remove();
    $('body').append(layout);
    popup($('#layout'), 'fixed');
    $('#layout.message textarea').focus();
  });

  $('#layout.message button').live('click', function() {
    var $this = $(this);
    var $layout = $(this).parents('#layout');
    var $form = $layout.find('form');
    var action = $form.attr('action');
    var $textarea = $form.find('textarea');
    var content = $textarea.val();

    var args = {'content': content, '_xsrf': get_cookie('_xsrf')};

    $.post(action, $.param(args), function(data) {
      $this.removeAttr('disabled');
      if (data.status === 'success') {
        $layout.fadeOut();
        noty(data);

        $textarea.val('');
      } else {
        noty(data);
      }
    });

    $(this).attr('disabled', 'disabled');
    return false;
  });

  $('.message-fm button').live('click', function() {
    var $this = $(this);
    var $form = $this.parents('form');
    var $textarea = $form.find('textarea');
    var action = $form.attr('action'),
        content = $textarea.val(),
        $items = $this.parents('.message-fm').prev('ul');

    var args = {'content': content, '_xsrf': get_cookie('_xsrf')};

    $.post(action, $.param(args), function(data) {
      $this.removeAttr('disabled');
      if (data.status === 'success') {
        var source =
            '<li id="show-<%= id %>" data-id="<%= id %>" class="item message clearfix me">'
        +     '<a class="avatar" href="<%= url %>">'
        +       '<img class="avatar" src="<%= avatar %>">'
        +     '</a>'
        +     '<div class="item-content">'
        +       '<div class="meta">'
        +         '<span class="time"><%= created %></span>'
        +       '</div>'
        +       '<div class="content">'
        +         '<%= content %>'
        +         '<div class="caret">'
        +           '<div class="caret-outer"></div>'
        +           '<div class="caret-inner"></div>'
        +         '</div>'
        +       '</div>'
        +     '</div>'
        +   '</li>';

        var render = template.compile(source);
        var html = render(data);

        $items.append(html);
        var $show = $('#show-' + data.id);
        $show.hide().fadeIn();

        $textarea.val('');
      } else {
        noty(data);
      }
    });

    $(this).attr('disabled', 'disabled');
    return false;
  });

  $('.more > a').live('click', function() {
    var $more = $(this).parents('.more');
    var $more_list = $more.find('.menu-list');
    if ($more_list.hasClass('open')) {
      $more_list.removeClass('open');
    } else {
      $more_list.addClass('open');
    }
    return false;
  });
  $(document).click(function() {
    var $d = $('.open.menu-list');
    $d.removeClass('open');
  });
});
