import React, { FC } from "react";
import { Box, Select, useColorModeValue } from "@chakra-ui/react";

interface BoardGameSelectProps {
	selectedBoardGame: string;
	knownBoardGames: string[];
	onSelectBoardGame: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const BoardGameSelect: FC<BoardGameSelectProps> = ({
	selectedBoardGame,
	knownBoardGames,
	onSelectBoardGame,
}) => {
	return (
		<Select
			value={selectedBoardGame}
			onChange={onSelectBoardGame}
			borderRadius="1.5rem"
			placeholder="Select a board game"
			bg={useColorModeValue("white", "gray.800")}
			borderColor={useColorModeValue("gray.200", "gray.600")}
		>
			{knownBoardGames.map((game, index) => (
				<option key={index} value={game}>
					{game}
				</option>
			))}
		</Select>
	);
};
