export default (controllerFucntion)=>(req, res, next) =>
Promise.resolve(controllerFucntion(req, res, next)).catch(next);