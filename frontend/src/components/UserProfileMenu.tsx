import React from "react";
import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Avatar,
	Text,
	Box,
	Divider,
} from "@chakra-ui/react";
import { useAuth0 } from "@auth0/auth0-react";
import { FiLogOut } from "react-icons/fi";

export const UserProfileMenu = () => {
	const { user, logout } = useAuth0();

	return (
		<Menu>
			<MenuButton>
				<Avatar
					size="sm"
					name={user?.name || user?.email}
					src={user?.picture}
					bg="gray.200"
					color="gray.600"
					cursor="pointer"
					_hover={{ 
						opacity: 0.8,
						color: "gray.900",
						boxShadow: "0 0 0 3px gray.600"
					}}
				>
				</Avatar>
			</MenuButton>
			<MenuList
				borderRadius="10px"
				padding="0.3rem"
				minWidth="12rem"
				right={0}
			>
				<Box px={3} py={2}>
					<Text fontSize="sm" color="gray.600">
						{user?.email}
					</Text>
				</Box>
				<Divider my={1}/>
				<MenuItem 
					onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
					fontWeight="normal"
					fontSize="sm"
					backgroundColor="transparent"
					borderRadius="5px"
					color="gray.600"
					_hover={{
						backgroundColor: "gray.50",
						borderRadius: "5px",
					}}
					icon={<FiLogOut />}
				>
					Log out
				</MenuItem>
			</MenuList>
		</Menu>
	);
}; 