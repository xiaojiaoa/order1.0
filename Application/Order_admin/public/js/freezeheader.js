/**
 * Created by jxy on 2017/3/20.
 */
/* ------------------------------------------------------------------------
 Class: freezeHeader
 Use:freeze header row in html table
 Example 1:  $('#tableid').freezeHeader();

 -------------------------------------------------------------------------*/
(function ($) {
    var TABLE_ID = 0;
    $.fn.freezeHeader = function (params) {

        // var copiedHeader = false;

        function freezeHeader(elem) {
            var idObj = elem.attr('id') || ('tbl-' + (++TABLE_ID));
            if (elem.length > 0 && elem[0].tagName.toLowerCase() == "table") {

                var obj = {
                    id: idObj,
                    grid: elem,
                    header: elem.find('thead'),
                };


                // console.log( 'header',obj.header)


                // var firstTd = obj.grid.find('tbody tr').eq(0);

                // console.log( 'firstTd',firstTd)
                // console.log( 'firstTd',firstTd.width())
                // console.log( 'header',obj.header)


                elem.append('<tfoot>'+obj.header.html()+'</tfoot>')
                var tfoot = elem.find('tfoot')
                tfoot.find('th').each(function (index) {
                    var cellWidth = obj.header.find('th').eq(index).css('width');
                    var cellHeight = obj.header.find('th').eq(index).css('height');
                    $(this).css('width', cellWidth);
                    $(this).css('height', cellHeight);
                    $(this).attr('index', index);
                    // obj.header.find('th').css('height',$(this).css('height'));
                });
                tfoot.css('position','absolute').css('top',0);
                // elem.append(footer)
                $(window).resize(function() {
                    tfoot.find('th').each(function (index) {
                        var cellWidth = obj.header.find('th').eq(index).css('width');
                        $(this).css('width', cellWidth);
                    });
                });

            }
        }


        return this.each(function (i, e) {
            freezeHeader($(e));
            TABLE_ID ++;
        });

    };
})(jQuery);