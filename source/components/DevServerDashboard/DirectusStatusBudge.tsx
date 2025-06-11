import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { DashboardBudge } from "./DashboardBudge.js";
import { ping } from "../../utils/netUtils/ping.js";

export const DirectusStatusBudge: React.FC = () => {
	const [online, setOnline] = useState<boolean | null>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			ping("localhost", 8055).then(setOnline);
		}, 3_000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	if (online === null) {
		return null;
	}

	const content = ` is ${online ? "up" : "down"}`;
	const color = online ? "greenBright" : "redBright";

	return (
		<DashboardBudge color={color}>
			<Box flexDirection="column">
				<Box>
					<Text color={color}>Local directus</Text>
					<Text color={color}>{content}</Text>
				</Box>
				<Text>http://localhost:8055</Text>
			</Box>
		</DashboardBudge>
	);
};
