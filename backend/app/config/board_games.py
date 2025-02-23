# Board game definitions and related utilities
BOARD_GAMES = [
    {
        "name": "Gloomhaven: Jaws of the Lion",
        "rulebooks": [
            {
                "name": "Glossary",
                "download_url": "https://comparajogos-forum.s3.dualstack.sa-east-1.amazonaws.com/uploads/original/2X/e/e6fb769d1c8b7730e40cbe95d93c641ed83638c0.pdf"
            },
            {
                "name": "Learn to Play Guide",
                "download_url": "https://cdn.1j1ju.com/medias/c1/6f/d7-gloomhaven-jaws-of-the-lion-rulebook.pdf",
            },
        ]
    },
    {
        "name": "Root",
        "rulebooks": [
            {
                "name": "Law of Root",
                "download_url": "https://cdn.shopify.com/s/files/1/0106/0162/7706/files/Root_Base_Law_of_Root_Sep_5_2024.pdf?v=1729175648",
            },
            {
                "name": "Learning to Play",
                "download_url": "https://cdn.shopify.com/s/files/1/0106/0162/7706/files/Root_Base_Learn_to_Play_web_Oct_15_2020.pdf?v=1603389572",
            }
        ]
    },
    {
        "name": "Dominion",
        "rulebooks": [
            {
                "name": "Dominion Rulebook",
                "download_url": "https://cdn.1j1ju.com/medias/59/e6/c2-dominion-rulebook.pdf",
            }
        ]
    }
]

BOARD_GAMES_STRING_LIST = "\n".join([f"- {board_game['name']}" for board_game in BOARD_GAMES]) 