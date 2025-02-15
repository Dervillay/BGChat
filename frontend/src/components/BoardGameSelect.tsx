import React, { FC } from "react";
import { Select } from "@chakra-ui/react";

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
			placeholder="Select a board game"
			variant="select"
		>
			{knownBoardGames.map((game, index) => (
				<option key={index} value={game}>
					{game}
				</option>
			))}
		</Select>
	);
};
