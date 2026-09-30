const Jimp = require('jimp');
Jimp.read('frontend/public/logo.png').then(image =  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    var red = this.bitmap.data[idx + 0];
    var green = this.bitmap.data[idx + 1];
    var blue = this.bitmap.data[idx + 2];
    var max = Math.max(red, green, blue);
    this.bitmap.data[idx + 3] = max;
    if (max  {
      this.bitmap.data[idx + 0] = Math.min(255, red * 255 / max);
      this.bitmap.data[idx + 1] = Math.min(255, green * 255 / max);
      this.bitmap.data[idx + 2] = Math.min(255, blue * 255 / max);
    }
  });
  image.write('frontend/public/logo.png');
  console.log('Logo processed successfully');
}).catch(err = console.error(err); });