
const loadImage = function newImageOnloadAndOnerror(url, resolve)  {
	const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve({url, status: 'error'});
  image.src = url;
	return image;
};

// it must be arrow function because promise
const checkImage = url =>
  new Promise(resolve => {
    loadImage(url, resolve);
  });

const getShaders = url =>  fetch(url).then(resp => resp.text());

const loadImagesAndShaders = (paths) => Promise.all(paths.map((path) => {
  const glslFile = /.(?:glsl)/g;
  return (path.search(glslFile) === -1) ? checkImage(path) : getShaders(path);
}));

function separateImagesAndShaders(imagesAndShaders) {
  const shaders = [];
  const images = [];
  imagesAndShaders.forEach((el) => (typeof el !== "string") ? images.push(el) : shaders.push(el));
  return {shaders, images}
}

export {loadImagesAndShaders, separateImagesAndShaders}