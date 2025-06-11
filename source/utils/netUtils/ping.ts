import net from 'net';

export const ping = (domain: string, port: number): Promise<boolean> => {
	return new Promise(res => {
		const socket = new net.Socket();

		socket.setTimeout(250);
		const resWith = (data: boolean) => () => {
			res(data);
			socket.destroy();
		};

		socket.on('connect', resWith(true));
		socket.on('error', resWith(false));
		socket.on('timeout', resWith(false));

		socket.connect(port, domain);
	});
};
