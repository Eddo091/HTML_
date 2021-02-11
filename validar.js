$(function(){

    //numéricos
    $('.enteros').keyup(function() {
                    if (this.value.match(/[^0-9]/g)) {                    
                         this.value = this.value.replace(/[^0-9]/g, '');
                    }
      });

    
      //decimales
    $(".decimales").on("keypress keyup blur",function (event) {           
        $(this).val($(this).val().replace(/[^0-9\.]/g,''));
               if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
                   event.preventDefault();
               }
   });
    
    $(".numericos").keypress(function (e) {
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                 return false;
        }
    });
    
    //alfabéticos
     $('.alfabeticos').keyup(function() {
                    if (this.value.match(/[^a-zA-Z ]/g)) {
                        this.value = this.value.replace(/[^a-zA-Z ]/g, '');
                    }
      });

    //alfanuméricos
    $('.alfanumericos').keyup(function() {
        if (this.value.match(/[^a-zA-Z0-9 ]/g)) {
            this.value = this.value.replace(/[^a-zA-Z0-9 ]/g, '');
            }
        });
    });