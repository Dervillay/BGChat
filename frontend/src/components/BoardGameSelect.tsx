import { FC } from "react";
import { Select } from "chakra-react-select";
import { theme } from "../theme/index.ts";

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

	return (
		<Select
			options={options}
			isMulti={false}
			value={selectedBoardGame ? { value: selectedBoardGame, label: selectedBoardGame } : undefined}
			onChange={(selectedBoardGame) => selectedBoardGame && onSelectBoardGame(selectedBoardGame.value)}
			placeholder={selectedBoardGame ? undefined : "Select a board game"}
			size="sm"
			menuPlacement="top"
			chakraStyles={{
				control: (provided, state) => theme.components.BoardGameSelect.control(provided, state, selectedBoardGame),
				singleValue: theme.components.BoardGameSelect.singleValue,
				dropdownIndicator: theme.components.BoardGameSelect.dropdownIndicator,
				menu: theme.components.BoardGameSelect.menu,
				menuList: theme.components.BoardGameSelect.menuList,
				option: theme.components.BoardGameSelect.option,
				placeholder: theme.components.BoardGameSelect.placeholder,
			}}
		/>
	);
};

