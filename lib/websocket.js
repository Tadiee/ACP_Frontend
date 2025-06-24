class WebSocketService {
    static instance = null;
    callbacks = {};

    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    constructor() {
        this.socketRef = null;
    }

    connect() {
        const path = `ws://${window.location.host}/ws/chart-data/`;
        this.socketRef = new WebSocket(path);
        
        this.socketRef.onopen = () => {
            console.log('WebSocket connected');
        };

        this.socketRef.onmessage = (e) => {
            this.socketNewMessage(e.data);
        };

        this.socketRef.onerror = (e) => {
            console.log('WebSocket error: ', e);
        };

        this.socketRef.onclose = () => {
            console.log('WebSocket closed. Reconnecting...');
            setTimeout(() => {
                this.connect();
            }, 5000);
        };
    }

    socketNewMessage(data) {
        const parsedData = JSON.parse(data);
        if (Object.keys(this.callbacks).length === 0) return;
        
        Object.values(this.callbacks).forEach(callback => {
            callback(parsedData);
        });
    }

    addCallbacks(callback) {
        const id = Date.now().toString();
        this.callbacks[id] = callback;
        return id;
    }

    removeCallback(id) {
        delete this.callbacks[id];
    }

    state() {
        return this.socketRef.readyState;
    }
}

const WebSocketInstance = WebSocketService.getInstance();
export default WebSocketInstance;