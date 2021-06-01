sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, MessageToast, Fragment, ResourceModel, Filter, FilterOperator, Sorter) {
   "use strict";
   return Controller.extend("org.ubb.books.controller.BookList", {

        onInit: function(){
            this.book = {
                Id_checkout : "",
                Title:"",
                Author:"",
                First_name: "",
                Last_name: "",
                Date_checkout:"2021-05-07T00:00:00",
                Date_return:"2021-05-07T00:00:00",
                Username:"",
                Isbn:""
            }
        },

        /*
        * This function is called when the users presses on the "Filter" Button.
        * It takes all the values from the input fields and pushes Filters to the Gateway Service
        */
        onSearchButtonPressed(oEvent){
            // Get the Data from the Inputs
            var isbn = this.byId("inputISBN").getValue();
            var title = this.byId("inputTitle").getValue();
            var author = this.byId("inputAuthor").getValue();
            var language = this.byId("inputLanguage").getValue();
            var dateStart = this.byId("inputDateStart").getValue();
            var dateEnd = this.byId("inputDateEnd").getValue();

            var aFilter = [];
            var oList = this.getView().byId("idBooksTable");
            var oBinding = oList.getBinding("items");

            // Push set filters
            if (isbn) {
                aFilter.push(new Filter("Booksid", FilterOperator.EQ, isbn))
            }
            if (author) {
                aFilter.push(new Filter("Author", FilterOperator.EQ, author));
            }
            if (title) {
                aFilter.push(new Filter("Title", FilterOperator.EQ, title));
            }
            if (dateStart && dateEnd) {
                var filter = new Filter("DatePublished", FilterOperator.BT, dateStart, dateEnd);
                aFilter.push(filter);
            } else {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                MessageToast.show(oResourceBundle.getText("dateStartOrDateEndNotSetError"));
            }
            if (language) {
                aFilter.push(new Filter("Language", FilterOperator.EQ, language));
            }
            oBinding.filter(aFilter);
        },

        /*
        * Opens the Fragment which displays the Sort Options
        */
        onSortButtonPressed(oEvent){
            this._oDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.sorter", this);
            this.getView().addDependent(this._oDialog);
            this._oDialog.open();
        },

        /*
        * Triggers when the confirm button on the Sort Fragment is pressed
        */
        onConfirmSort(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var oView = this.getView();
            var oTable = oView.byId("idBooksTable");
            var mParams = oEvent.getParameters();
            var oBinding = oTable.getBinding("items");

            // apply the sorter
            var aSorters = [];
            var sPath = mParams.sortItem.getKey();
            var bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            oBinding.sort(aSorters);
            MessageToast.show(oResourceBundle.getText("succes"));

        },

        /*
        * Checks a book out.
        */
        onCheckoutBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var aSelContext = this.byId("idBooksTable").getSelectedContexts();
            
            if (!aSelContext.length == 0){
                // MessageToast.show(oResourceBundle.getText("notYetImplemented"));
                for(var i = 0; i < aSelContext.length; i++){
                    //alert(aSelContext[i]);
                    var oBook = aSelContext[i].getObject();
                    if(oBook.NrAvailable>0){
                    //alert(oBook.Title);
                    //alert(oBook.Author);
                    this.book.Isbn = oBook.Booksid;
                    this.book.Title = oBook.Title;
                    this.book.Author = oBook.Author;
                    this.book.Date_checkout = oBook.DatePublished;
                    this.book.Date_return = oBook.DatePublished;
                    this.book.Id_checkout = 0;
                    //alert(this.book.Isbn + " " + this.book.Title + " " + this.book.Author);
                    var odataModel = new sap.ui.model.odata.ODataModel("http://localhost:9555/sap/opu/odata/SAP/Z801_TEST_BOOK_DOPO_SRV/");
                        odataModel.create("/BookschSet",this.book, null, function() {
                            MessageToast.show(oResourceBundle.getText("succesaddedthing"));
                        }, function(){
                            MessageToast.show(oResourceBundle.getText("updateError"));
                        });
                }else{
                    MessageToast.show(oResourceBundle.getText("nrgreater"));
                }
                    }
            } else {
                MessageToast.show(oResourceBundle.getText("noSelectionCheckoutError"));
            }
            this.byId("idBooksTable").getBinding("items").refresh();
        }

    });
});