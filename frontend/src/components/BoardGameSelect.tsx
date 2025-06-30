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
				control: (provided, state) => ({
					...provided,
					border: 'none',
					boxShadow: 'none',
					minWidth: 'fit-content',
					minWidth: { base: '10.5rem', md: '11.5rem' },
					color: 'gray.600',
					fontSize: { base: 'xs', md: 'sm' },
					'&:hover': {
						boxShadow: 'none',
						border: '1px',
						borderColor: 'gray.200',
						cursor: 'pointer',
					},
					'&:focus-within': {
						boxShadow: 'none',
					},
					...(state.isFocused && {
						border: '1px',
						borderColor: 'gray.200',
					}),
				}),
				menu: (provided) => ({
					...provided,
					minWidth: { base: '13rem', md: '18rem' },
					borderRadius: '10px',
					right: 0,
				}),
				menuList: (provided) => ({
					...provided,
					borderRadius: '10px',
					padding: '0.3rem',
				}),
				option: (provided, state) => ({
					...provided,
					fontWeight: 'normal',
					backgroundColor: 'transparent',
					color: 'gray.600',
					fontSize: { base: 'xs', md: 'sm' },
					'&:hover': {
						backgroundColor: 'gray.50',
						borderRadius: '5px',
					},
					...(state.isSelected && {
						color: 'gray.900',
					}),
				}),
				dropdownIndicator: (provided) => ({
					...provided,
					color: 'gray.600',
					marginLeft: '-2rem',
				}),
			}}
		/>
	);
};

