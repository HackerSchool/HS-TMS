Dependencies:

1. pdfmake: `npm install pdfmake` (used to create the report itself)
2. pdf-lib: `npm install pdf-lib` (used to attach other PDF's to it)

It's necessary to store the fonts and images we'll be using in the pdfmake VFS.  
Do as follows:

1. create the directory `node_modules/pdfmake/report/assets`
2. copy all the files to it
3. `cd` to `node_modules/pdfmake`
4. run `node build-vfs.js "./report/assets" "./build/vfs.js"`
