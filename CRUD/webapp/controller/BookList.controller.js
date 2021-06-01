sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/resource/ResourceModel"
], function (Controller, MessageToast, Fragment,ResourceModel) {
   "use strict";
   return Controller.extend("org.ubb.books.controller.BookList", {
        
        onInit: function(){
            this.book = {
                Booksid : "",
                Author:"",
                Title:"",
                DatePublished: "",
                Language:"",
                NrAvailable: 0,
                NrTotal: 0
            }

        },

        onDeleteBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
            if (aSelContexts.length != 0){
            const sBookPath = aSelContexts[0].getPath();
            this.getView().getModel().remove(sBookPath);
            MessageToast.show(oResourceBundle.getText("deleteok"));
            }else {
                MessageToast.show(oResourceBundle.getText("noSelectionDeleteError"));
            }
        },

        onInsertBook(oEvent){
            if(!this.newBookDialog){
                this.newBookDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.insert",this);
            }
            this.resetBook();
            var oModel = new sap.ui.model.json.JSONModel();
            this.newBookDialog.setModel(oModel);
            this.newBookDialog.getModel().setData(this.book);
            this.newBookDialog.open();
        },

        onUpdateBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelContext = this.byId("idBooksTable").getSelectedContexts();
            if (aSelContext.length != 0){
                var oBook = aSelContext[0].getObject();
                oBook = this.parseDatePublishedForUpdate(oBook);
                this.book = oBook;
                if(!this.updateBookDialog){
                    this.updateBookDialog = sap.ui.xmlfragment("org.ubb.books.view.fragment.update",this);
                }
                var oModel = new sap.ui.model.json.JSONModel();
                this.updateBookDialog.setModel(oModel);
                this.updateBookDialog.getModel().setData(this.book);
                this.updateBookDialog.open();
            } else {
                MessageToast.show(oResourceBundle.getText("noSelectionUpdateError"));
            }
        },

        parseDatePublishedForCreate(oBook){
            var dateString = oBook.DatePublished;
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
            var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
            var parsedDate = new Date(dateFormat.parse(dateString).getTime() - TZOffsetMs).getTime();
            oBook.DatePublished ="\/Date(" + parsedDate + ")\/";
            return oBook;
        },

        parseDatePublishedForUpdate(oBook){
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" }); 
            var date = new Date(oBook.DatePublished);
            var dateStr = dateFormat.format(date);
            oBook.DatePublished = dateStr;
            //oBook = this.parseDatePublishedForCreate(oBook);
            return oBook;
        },
    
        saveBook(oEvent){
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if (this.book.NrTotal < this.book.NrAvailable){
                MessageToast.show(oResourceBundle.getText("totalNumberError"));
            } else {
                this.book = this.parseDatePublishedForUpdate(this.book);
                
                var oModel = this.getView().getModel();
                this.book.DatePublished="2021-06-01T00:00:00";
                //var odataModel = new sap.ui.model.odata.ODataModel("http://localhost:9555/sap/opu/odata/SAP/Z801_TEST_BOOK_DOPO_SRV/");
                oModel.create('/BooksSet', this.book, {
                    success: function() {
                        MessageToast.show(oResourceBundle.getText("saveSuccess"));
                    },
                    error: function(){
                        MessageToast.show(oResourceBundle.getText("saveError"));
                    }
                });
                this.newBookDialog.close();
            }
        },

        updateBook(oEvent){
            debugger;
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if (this.book.NrTotal < this.book.NrAvailable){
                MessageToast.show(oResourceBundle.getText("totalNumberError"));
            } else {
                this.book = this.parseDatePublishedForCreate(this.book);
                const aSelContexts = this.byId("idBooksTable").getSelectedContexts();
                const sBookPath = aSelContexts[0].getPath();
               // this.book.DatePublished="1999-01-20T00:00:00";
                var oModel = this.getView().getModel();
                oModel.update(sBookPath, this.book, {
                    success: function() {
                        MessageToast.show(oResourceBundle.getText("updateSuccess"));
                    },
                    error: function(){
                        MessageToast.show(oResourceBundle.getText("updateError"));
                    }
                });
                this.updateBookDialog.close();
            }
        },

        closeDialog(oEvent){
            if (this.newBookDialog){
                this.newBookDialog.close();
            }
            if (this.updateBookDialog){
                this.updateBookDialog.close();
            }
        },

        resetBook(){
            this.book.Booksid = "";
            this.book.Title = "";
            this.book.Author = "";
            this.book.DatePublished = "";
            this.book.Language = "";
            this.book.NrTotal = 0;
            this.book.NrAvailable = 0;
        }
    });
});