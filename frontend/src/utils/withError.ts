export async function withError<T>(
    fn: () => Promise<T>
  ): Promise<T> {
    const response = await fn();
  
    if (response instanceof Response && !response.ok) {
        let errorBody: any = {};
        try {
            errorBody = await response.json();
        } catch {
            errorBody = { message: response.statusText };
        } throw {
            status: response.status,
            message: errorBody.error || errorBody.message || response.statusText,
            body: errorBody,
        };
    }
  
    return response;
  }
