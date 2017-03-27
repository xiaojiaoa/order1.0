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

    var copiedHeader = false;

    function freezeHeader(elem) {
      var idObj = elem.attr('id') || ('tbl-' + (++TABLE_ID));
      if (elem.length > 0 && elem[0].tagName.toLowerCase() == "table") {

        var obj = {
          id: idObj,
          grid: elem,
          container: null,
          header: null,
          divScroll: null,
          openDivScroll: null,
          closeDivScroll: null,
          scroller: null
        };


          obj.header = obj.grid.find('thead');
          if (params && params.height !== undefined) {
              if ($('#hdScroll' + obj.id).length == 0) {
                  obj.grid.wrapAll(obj.divScroll);
              }
          }





        if (params && params.height !== undefined) {
          obj.divScroll = '<div id="hdScroll' + obj.id + '" style="height: ' + params.height + '; overflow-y: scroll">';
          obj.closeDivScroll = '</div>';
        }



        obj.scroller = params && params.height !== undefined
          ? $('#hdScroll' + obj.id)
          : $(window);
        if (params && params.scrollListenerEl !== undefined) {
          obj.scroller = params.scrollListenerEl;
        }
        obj.scroller.on('scroll', function () {
          if ($('#hd' + obj.id).length == 0) {
            obj.grid.before('<div id="hd' + obj.id + '"></div>');
          }

          obj.container = $('#hd' + obj.id);

            cloneHeaderRow(obj);
            copiedHeader = true;

        });
      }
    }

    function cloneHeaderRow(obj) {
      obj.container.html('');
      obj.container.val('');
      var tabela = $('<table style="margin: 0 0;"></table>');
      var atributos = obj.grid.prop("attributes");

      $.each(atributos, function () {
        if (this.name != "id") {
          tabela.attr(this.name, this.value);
        }
      });

      tabela.append('<thead>' + obj.header.html() + '</thead>');

      obj.container.append(tabela);
      obj.container.width(obj.header.width());
      obj.container.height(obj.header.height);
      obj.container.find('th').each(function (index) {
        var cellWidth = obj.grid.find('th').eq(index).width();
        $(this).css('width', cellWidth);
      });

      obj.container.css("visibility", "visible");
      obj.container.css("z-index", "999");
      obj.container.css("top", "0px");
      obj.container.css("position", "absolute");

    }

    return this.each(function (i, e) {
      freezeHeader($(e));
    });

  };
})(jQuery);