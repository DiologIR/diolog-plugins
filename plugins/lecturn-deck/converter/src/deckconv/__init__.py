"""deckconv — a stdlib-only two-way converter between PowerPoint (.pptx) and the
``lecturn.deck/1`` JSON slide schema.

Public API:
    pptx_to_deck(path) -> (deck_dict, {asset_filename: bytes})
    deck_to_pptx(deck_dict, out_path, assets_base) -> [report_line, ...]
    validate_deck(deck_dict) -> [error_string, ...]   # empty == valid
"""

from .frompptx import pptx_to_deck
from .topptx import deck_to_pptx
from .validate import validate_deck

__all__ = ["pptx_to_deck", "deck_to_pptx", "validate_deck"]
__version__ = "1.0.0"
