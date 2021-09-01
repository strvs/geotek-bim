$(document).ready(function() {

    $.validator.addMethod('phoneRU',
        function(phone_number, element) {
            return this.optional(element) || phone_number.match(/^\+7 \(\d{3}\) \d{3}\-\d{2}\-\d{2}$/);
        },
        'Ошибка заполнения'
    );

    $('body').on('focus', '.form-input input, .form-input textarea', function() {
        $(this).parent().addClass('focus');
    });

    $('body').on('blur', '.form-input input, .form-input textarea', function() {
        $(this).parent().removeClass('focus');
        if ($(this).val() != '') {
            $(this).parent().addClass('full');
        } else {
            $(this).parent().removeClass('full');
        }
    });

    $('body').on('change', '.form-file input', function() {
        var curInput = $(this);
        var curField = curInput.parents().filter('.form-file');
        var curForm = curField.parents().filter('form');
        var curName = curInput.val().replace(/.*(\/|\\)/, '');
        var curNameArray = curName.split('.');
        var curExt = curNameArray[curNameArray.length - 1];
        curNameArray.pop();
        var curNameText = curNameArray.join('.');
        if (curNameText.length > 10) {
            curNameText = curNameText.substring(0, 10) + '...' + curNameText.slice(-1);
        }
        curField.find('.form-file-name-text').html(curNameText + '.' + curExt);
        curForm.find('.form-files').append(curForm.data('filesCode'));
    });

    $('body').on('click', '.form-file-name-remove', function() {
        var curField = $(this).parents().filter('.form-file');
        curField.remove();
    });

    $('form').each(function() {
        initForm($(this));
    });

    $('body').on('click', '.window-link', function(e) {
        var curLink = $(this);
        windowOpen(curLink.attr('href'));
        e.preventDefault();
    });

    $('body').on('keyup', function(e) {
        if (e.keyCode == 27) {
            windowClose();
        }
    });

    $(document).click(function(e) {
        if ($(e.target).hasClass('window')) {
            windowClose();
        }
    });

    $(window).resize(function() {
        windowPosition();
    });

    $('body').on('click', '.window-close, .window-thanks-close', function(e) {
        windowClose();
        e.preventDefault();
    });

    $('.footer-up-link').click(function(e) {
        $('html, body').animate({'scrollTop': 0});
        e.preventDefault();
    });

    $('.header-mobile-link').click(function(e) {
        $('html').toggleClass('mobile-menu-open');
        e.preventDefault();
    });

    $('.mobile-menu-list ul li a').click(function(e) {
        var curLi = $(this).parent();
        if (curLi.find('ul').length > 0) {
            if (curLi.hasClass('open')) {
                $('.mobile-menu').removeClass('open-menu');
                curLi.removeClass('open');
            } else {
                $('.mobile-menu').addClass('open-menu');
                curLi.addClass('open');
            }
            e.preventDefault();
        }
    });

    $('nav ul ul a, .mobile-menu-list ul ul a').click(function(e) {
        var curBlock = $(this.hash + '-block');
        if (curBlock.length > 0) {
            $('html, body').animate({'scrollTop': curBlock.offset().top});
            e.preventDefault();
        }
    });

    $('#buy-summ').each(function() {
        recalcBuy();
    });

    $('.buy-checkbox input').on('change', function() {
        recalcBuy();
    });

});

function recalcBuy() {
    var curSumm = 0;
    $('.buy-checkbox input:checked').each(function() {
        var curRow = $(this).parents().filter('.buy-row');
        curSumm += Number(curRow.find('.buy-price').html().replace(/ /g, ''));
    });
    $('#buy-summ').html(String(curSumm).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1&nbsp;'));
}

function initForm(curForm) {
    curForm.find('.form-input input, .form-input textarea').each(function() {
        if ($(this).val() != '') {
            $(this).parent().addClass('full');
        }
    });

    curForm.find('.form-input textarea').each(function() {
        $(this).css({'height': this.scrollHeight, 'overflow-y': 'hidden'});
        $(this).on('input', function() {
            this.style.height = '35px';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });

    curForm.find('input.phoneRU').mask('+7 (000) 000-00-00');

    if (curForm.find('.form-files').length > 0) {
        curForm.data('filesCode', curForm.find('.form-files').html());
    }

    curForm.validate({
        ignore: '',
        submitHandler: function(form) {
            if ($(form).hasClass('ajax-form')) {
                var formData = new FormData(form);

                if ($(form).find('[type=file]').length != 0) {
                    var file = $(form).find('[type=file]')[0].files[0];
                    formData.append('file', file);
                }

                windowOpen($(form).attr('action'), formData);
            } else {
                form.submit();
            }
        }
    });
}

function windowOpen(linkWindow, dataWindow) {
    if ($('.window').length > 0) {
        windowClose();
    }

    var curPadding = $('.wrapper').width();
    var curWidth = $(window).width();
    if (curWidth < 360) {
        curWidth = 360;
    }
    var curScroll = $(window).scrollTop();
    $('html').addClass('window-open');
    curPadding = $('.wrapper').width() - curPadding;
    $('body').css({'margin-right': curPadding + 'px'});
    $('body').append('<div class="window"><div class="window-loading"></div></div>')
    $('.wrapper').css({'top': -curScroll});
    $('.wrapper').data('curScroll', curScroll);
    $('meta[name="viewport"]').attr('content', 'width=' + curWidth);

    $.ajax({
        type: 'POST',
        url: linkWindow,
        processData: false,
        contentType: false,
        dataType: 'html',
        data: dataWindow,
        cache: false
    }).done(function(html) {
        $('.window').append('<div class="window-container window-container-preload"><div class="window-content">' + html + '<a href="#" class="window-close"></a></div></div>')

        windowPosition();

        $('.window-container-preload').removeClass('window-container-preload');

        $('.window form').each(function() {
            initForm($(this));
        });
    });
}

function windowPosition() {
    if ($('.window').length > 0) {
        $('.window-container').css({'left': '50%', 'margin-left': -$('.window-container').width() / 2});

        $('.window-container').css({'top': '50%', 'margin-top': -$('.window-container').height() / 2});
        if ($('.window-container').height() > $('.window').height()) {
            $('.window-container').css({'top': '0', 'margin-top': 0});
        }
    }
}

function windowClose() {
    if ($('.window').length > 0) {
        $('.window').remove();
        $('html').removeClass('window-open');
        $('body').css({'margin-right': 0});
        $('.wrapper').css({'top': 0});
        $(window).scrollTop($('.wrapper').data('curScroll'));
        $('meta[name="viewport"]').attr('content', 'width=device-width');
    }
}

$(window).on('load', function() {
    if (window.location.hash != '') {
        var curBlock = $(window.location.hash + '-block');
        if (curBlock.length > 0) {
            $('html, body').animate({'scrollTop': curBlock.offset().top});
        }
    }
});