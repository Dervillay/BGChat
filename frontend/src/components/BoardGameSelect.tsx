import React, { FC } from "react";
import { Select } from "chakra-react-select";

interface BoardGameSelectProps {
	selectedBoardGame: string;
	knownBoardGames: string[];
	onSelectBoardGame: (selectedBoardGame: string) => void;
}

export const BoardGameSelect: FC<BoardGameSelectProps> = ({
	selectedBoardGame,
	knownBoardGames,
	onSelectBoardGame,
}) => {
	const options = knownBoardGames.map(game => ({
		value: game,
		label: game
	}));

	// TODO: Move chakraStyles to theme
	return (
		<Select
			options={options}
			isMulti={false}
			value={selectedBoardGame ? { value: selectedBoardGame, label: selectedBoardGame } : undefined}
			onChange={(selectedBoardGame) => selectedBoardGame && onSelectBoardGame(selectedBoardGame.value)}
			placeholder={selectedBoardGame ? undefined : "Select a board game"}
			size="md"
			chakraStyles={{
				container: (provided) => ({
					...provided,
					minWidth: '15rem',
				}),
				menu: (provided) => ({
					...provided,
					borderRadius: '10px',
					boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
				}),
				menuList: (provided) => ({
					...provided,
					borderRadius: '10px',
				}),
				option: (provided, state) => ({
					...provided,
					fontWeight: state.isSelected ? '600' : 'normal',
					backgroundColor: 'transparent',
					color: 'black',
				}),
				singleValue: (provided) => ({
					...provided,
					fontWeight: '600',
				}),
			}}
		/>
	);
};
