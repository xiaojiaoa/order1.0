/**
 * Created by jxy on 2017/3/20.
 */
/* ------------------------------------------------------------------------
 Class: freezeHeader
 Use:freeze header row in html table
 Example 1:  $('#tableid').freezeHeader();
 Example 2:  $("#tableid").freezeHeader({ 'height': '300px' });
 Example 3:  $("table").freezeHeader();
 Example 4:  $(".table2").freezeHeader();
 Example 5:  $("#tableid").freezeHeader({ 'offset': '50px' });
 Author(s): Laerte Mercier Junior, Larry A. Hendrix
 Version: 1.0.7
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
                    $(window).resize(function() {
                        cellWidth = obj.header.find('th').eq(index).css('width');
                        window.location.reload();
                    });
                    $(this).css('width', cellWidth);
                    tfoot.css('position','absolute').css('top',0);
                });
                // elem.append(footer)


            }
        }


        return this.each(function (i, e) {
            freezeHeader($(e));
            TABLE_ID ++;
        });

    };
})(jQuery);