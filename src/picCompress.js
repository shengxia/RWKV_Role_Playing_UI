export const picCompress = {
  methods: {
    compressImg(file) {
      var read = new FileReader();
      read.readAsDataURL(file);
      return new Promise(function(resolve) {
        read.onload = function(e) {
          var img = new Image();
          img.src = e.target.result;
          img.onload = function() {
            var w = 64,
                h = 64;
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var base64;
            canvas.setAttribute("width", w);
            canvas.setAttribute("height", h);
            ctx.drawImage(this, 0, 0, w, h);
            base64 = canvas.toDataURL(file['type'], 0.8);
            resolve(base64)
          };
        };
      })
    },
    dataURLtoFile(dataurl) {
      var arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], {
        type: mime
      });
    }
  }
};