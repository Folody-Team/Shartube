
var nodeDoctype = document.implementation.createDocumentType(
  'Sharhtml',
  'Transitional//EN',
  'http://localhost:3000/shartube-html/sharhtml.dtd',
);
if(document.doctype) {
    document.replaceChild(nodeDoctype, document.doctype);
} else {
    document.insertBefore(nodeDoctype, document.childNodes[0]);
}