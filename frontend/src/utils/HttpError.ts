export class HttpError extends Error {
    public readonly status: number;
    public readonly body: any;

    constructor(message: string, status: number, body?: any) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.body = body;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    }
}
