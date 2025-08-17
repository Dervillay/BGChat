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
	Link,
} from "@chakra-ui/react";
import { useAuth0 } from "@auth0/auth0-react";
import { FiLogOut, FiGithub, FiHeart } from "react-icons/fi";

export const UserProfileMenu = () => {
	const { user, logout } = useAuth0();

	return (
		<Menu>
			<MenuButton
				_hover={{
					borderRadius: "full"
				}}
				transition="all 0.2s"
			>
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
					}}
				/>
			</MenuButton>
			<MenuList
				borderRadius="10px"
				padding="0.3rem"
				minWidth="12rem"
				right={0}
				bg="chakra-body-bg"
				border="1px solid"
				borderColor="gray.200"
				_dark={{
					borderColor: "#404040"
				}}
			>
				<Box px={3} py={2}>
					<Text fontSize="sm" color="gray.600" _dark={{ color: "#a0a0a0" }}>
						{user?.email}
					</Text>
				</Box>
				<Divider my={1} borderColor="gray.200" _dark={{ borderColor: "#404040" }}/>
				<MenuItem 
					as={Link}
					href="https://github.com/Dervillay/BGChat"
					isExternal
					fontWeight="normal"
					fontSize="sm"
					backgroundColor="transparent"
					borderRadius="5px"
					color="gray.600"
					_dark={{
						color: "#a0a0a0",
						_hover: {
							backgroundColor: "#404040",
							borderRadius: "5px",
							filter: "brightness(1.2)"
						}
					}}
					_hover={{
						backgroundColor: "gray.50",
						borderRadius: "5px",
						textDecoration: "none"
					}}
					icon={<FiGithub />}
				>
					GitHub
				</MenuItem>
				<MenuItem 
					as={Link}
					href="https://ko-fi.com/dervillay"
					isExternal
					fontWeight="normal"
					fontSize="sm"
					backgroundColor="transparent"
					borderRadius="5px"
					color="gray.600"
					_dark={{
						color: "#a0a0a0",
						_hover: {
							backgroundColor: "#404040",
							borderRadius: "5px",
							filter: "brightness(1.2)"
						}
					}}
					_hover={{
						backgroundColor: "gray.50",
						borderRadius: "5px",
						textDecoration: "none"
					}}
					icon={<FiHeart />}
				>
					Support the project
				</MenuItem>
				<MenuItem 
					onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
					fontWeight="normal"
					fontSize="sm"
					backgroundColor="transparent"
					borderRadius="5px"
					color="gray.600"
					_dark={{
						color: "#a0a0a0",
						_hover: {
							backgroundColor: "#404040",
							borderRadius: "5px",
							filter: "brightness(1.2)"
						}
					}}
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