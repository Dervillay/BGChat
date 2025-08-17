import { FC } from "react";
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
					minWidth: selectedBoardGame ? 'fit-content' : { base: '10.25rem', md: '11.5rem' },
					maxWidth: { base: '11,5rem', md: '11.5rem' },
					paddingRight: '1.25rem',
					color: 'chakra-body-text',
					fontSize: { base: 'sm', md: 'sm' },
					'&:hover': {
						boxShadow: 'none',
						border: '1px',
						borderColor: 'chakra-body-border-focus',
						cursor: 'pointer',
					},
					'&:focus-within': {
						boxShadow: 'none',
						border: '1px',
						borderColor: 'chakra-body-border-focus',
					},
					...(state.isFocused && {
						border: '1px',
						borderColor: 'chakra-body-border-focus',
					}),
				}),
				singleValue: (provided) => ({
					...provided,
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					maxWidth: '100%',
				}),
				dropdownIndicator: (provided) => ({
					...provided,
					color: 'chakra-body-text',
					marginRight: '0',
					position: 'absolute',
				}),
				menu: (provided) => ({
					...provided,
					minWidth: { base: '13rem', md: '18rem' },
					borderRadius: '10px',
					right: 0,
					borderColor: 'chakra-body-border',
				}),
				menuList: (provided) => ({
					...provided,
					borderRadius: '10px',
					padding: '0.3rem',
					backgroundColor: 'chakra-body-bg',
					_dark: {
						backgroundColor: 'chakra-body-message-bg',
					}
				}),
				option: (provided, state) => ({
					...provided,
					fontWeight: 'normal',
					backgroundColor: 'transparent',
					color: 'chakra-body-text',
					fontSize: { base: 'xs', md: 'sm' },
					'&:hover': {
						backgroundColor: 'chakra-body-message-bg',
						borderRadius: '5px',
					},
					_dark: {
						'&:hover': {
							backgroundColor: 'chakra-body-border',
						},
					},
					...(state.isSelected && {
						color: 'chakra-body-text-highlight',
					}),
				}),
				placeholder: (provided) => ({
					...provided,
					_dark: {
						color: '#a0a0a0',
					},
				}),
			}}
		/>
	);
};

