import { Message } from "../types/message";

export class MessageQueue {
    private queue: Message[] = [];
    private isProcessing = false;

    constructor(private onMessage: (message: Message) => void) {}

    public push(message: Message) {
        this.queue.push(message);
        this.processNext();
    }

    private async processNext() {
        if (this.isProcessing || this.queue.length === 0) return;
        
        this.isProcessing = true;
        const message = this.queue.shift()!;
        this.onMessage(message);
        await new Promise(resolve => setTimeout(resolve, 50));
        this.isProcessing = false;
        
        if (this.queue.length > 0) {
            this.processNext();
        }
    }
}
