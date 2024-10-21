const apiResponse = (payload = {}) => {
    const DataSymbol = Symbol("data");
    const StatusSymbol = Symbol("status");
    const ErrorsSymbol = Symbol("errors");
    const MessageSymbol = Symbol("message");
    const StatusCodeSymbol = Symbol("statusCode");
  
    class ApiResponse {
      constructor({
        data = {},
        status = 1,
        errors = [],
        message = "",
        statusCode,
      }) {
        this.data = data;
        this.status = status;
        this.errors = errors;
        this.message = message;
        this.statusCode = statusCode;
      }
  
      get data() {
        return this[DataSymbol];
      }
  
      set data(data) {
        if (typeof data === "undefined") throw new Error("Data must be defined");
        this[DataSymbol] = data;
      }
  
      get status() {
        return this[StatusSymbol];
      }
  
      set status(status) {
        if (isNaN(status) || (status !== 0 && status !== 1))
          throw new Error("Status must be a number, 1 is OK, 0 is BAD");
        this[StatusSymbol] = status;
      }
  
      get errors() {
        return this[ErrorsSymbol];
      }
  
      set errors(errors) {
        if (!Array.isArray(errors)) throw new Error("Errors must be an array");
        this[ErrorsSymbol] = errors;
      }
  
      get message() {
        return this[MessageSymbol];
      }
  
      set message(message) {
        if (typeof message !== "string")
          throw new Error("Message must be a string");
        this[MessageSymbol] = message;
      }
  
      get statusCode() {
        return this[StatusCodeSymbol];
      }
  
      set statusCode(statusCode) {
        const codes = [200, 201, 400, 401, 404, 403, 422, 500];
  
        // Get matched code
        const findCode = codes.find((code) => code == statusCode);
  
        if (!findCode) statusCode = 500;
        else statusCode = findCode;
  
        this[StatusCodeSymbol] = statusCode;
      }
  
      toJSON() {
        return {
          data: this.data,
          status: this.status,
          errors: this.errors, // this.errors.map((e) => (e.stack ? e.stack : e)),
          message: this.message,
        };
      }
    }
  
    return new ApiResponse(payload);
  };
  
  module.exports = apiResponse;
  