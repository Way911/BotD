const redis = require("redis");
const client = redis.createClient(6380, process.env.REDISCACHEHOSTNAME, {auth_pass: process.env.REDISCACHEKEY, tls: {servername: process.env.REDISCACHEHOSTNAME}});

export class RedisUtil {

    public static set(key: string, value: any, expireTime: number): void {
        if (expireTime) {
            return client.set(key, JSON.stringify(value), 'EX', expireTime)
        } else {
            return client.set(key, JSON.stringify(value))
        }
    }
    public static async get(key: string): Promise<any> {
        return this.text(key);
    }

    public static delete(key: string) {
        return client.del(key);
    }

    public static getDialogKey(id: string) {
        return `dialog-${id}`;
    }
    private static async text(key: string): Promise<any> {
        let doc: any = await new Promise((resolve) => {
            client.get(key, function (err, res) {
                return resolve(res);
            });
        });
        return JSON.parse(doc);

    }


}
