import re

DISEASE_DB = {
    "pepper_bell_bacterial_spot": {
        "plant": "Bell Pepper",
        "disease": "Bacterial Spot",
        "scientific_name": "Xanthomonas campestris pv. vesicatoria",
        "symptoms": [
            "Small, yellow-green spots on young leaves that turn brown.",
            "Water-soaked dark lesions on older leaves.",
            "Leaves may turn yellow and drop prematurely, exposing fruit to sunscald."
        ],
        "treatment": [
            "Apply copper-based fungicides or bactericides early in the disease cycle.",
            "Remove and destroy severely infected leaves and plants immediately.",
            "Avoid working in the garden when foliage is wet to prevent spreading the bacteria."
        ],
        "prevention": [
            "Use certified disease-free seeds and transplants.",
            "Avoid overhead irrigation; use drip irrigation or water at the base of the plant.",
            "Practice a 2-3 year crop rotation with non-solanaceous crops (avoid planting tomatoes or potatoes in the same spot)."
        ]
    },
    "pepper_bell_healthy": {
        "plant": "Bell Pepper",
        "disease": "Healthy",
        "scientific_name": "N/A",
        "symptoms": [
            "Lush, vibrant green leaves with strong, sturdy stems.",
            "No unusual spotting, yellowing, wilting, or fungal webbing.",
            "Normal growth of blossoms and fruit."
        ],
        "treatment": [
            "No chemical or physical treatment required.",
            "Continue regular watering and fertilization according to growth stage."
        ],
        "prevention": [
            "Keep the garden weed-free to prevent pest carriers.",
            "Add a layer of organic mulch to conserve moisture and regulate soil temperature.",
            "Perform weekly checkups to spot any early signs of pests or stressors."
        ]
    },
    "potato_early_blight": {
        "plant": "Potato",
        "disease": "Early Blight",
        "scientific_name": "Alternaria solani",
        "symptoms": [
            "Dark, concentric 'target-board' circular spots on older leaves first.",
            "Yellowing of leaf tissue surrounding the spots.",
            "In severe cases, entire leaves turn brown and fall off, reducing tuber yield."
        ],
        "treatment": [
            "Apply fungicides containing copper, chlorothalonil, or mancozeb at the first sign of symptoms.",
            "Prune the lower leaves to improve airflow and reduce soil splashing.",
            "Ensure adequate nitrogen fertilizer, as stressed/nutrient-deprived plants are more susceptible."
        ],
        "prevention": [
            "Rotate crops annually (avoid planting potatoes, tomatoes, or eggplants sequentially).",
            "Plant resistant or early-maturing potato varieties.",
            "Allow space between plants for excellent air circulation."
        ]
    },
    "potato_late_blight": {
        "plant": "Potato",
        "disease": "Late Blight",
        "scientific_name": "Phytophthora infestans",
        "symptoms": [
            "Large, irregular water-soaked dark green to black lesions on leaves and stems.",
            "A white, fuzzy mold growth on the undersides of leaves during humid/wet weather.",
            "Rapid collapse and rotting of entire foliage, spreading a distinctive foul odor."
        ],
        "treatment": [
            "Apply specialized late blight fungicides (e.g., copper-based or systemic fungicides) immediately.",
            "Immediately remove and destroy (burn or bury) infected plants. DO NOT compost them.",
            "In commercial settings, defoliate/kill vines to prevent spores from washing down to the tubers."
        ],
        "prevention": [
            "Always plant certified disease-free seed tubers.",
            "Avoid overhead watering and ensure plants are placed in sunny, well-ventilated areas.",
            "Monitor weather forecasts closely; late blight thrives in cool, wet, and humid conditions."
        ]
    },
    "potato_healthy": {
        "plant": "Potato",
        "disease": "Healthy",
        "scientific_name": "N/A",
        "symptoms": [
            "Strong, thick stems with full, uniformly green leaves.",
            "Absence of yellowing, dark concentric spots, or white mold fuzz.",
            "Robust vegetative growth."
        ],
        "treatment": [
            "No treatments necessary.",
            "Provide balanced organic nutrients to support tuber swelling."
        ],
        "prevention": [
            "Maintain consistent soil moisture without waterlogging the roots.",
            "Hill the potatoes regularly (adding soil around the base of the plant) to protect growing tubers."
        ]
    },
    "tomato_bacterial_spot": {
        "plant": "Tomato",
        "disease": "Bacterial Spot",
        "scientific_name": "Xanthomonas perforans / campestris",
        "symptoms": [
            "Numerous tiny, dark brown to black spots with a yellow halo on leaves.",
            "Spots may merge, causing leaves to dry out, turn brown, and drop.",
            "Dark, raised, blister-like spots on tomato fruits."
        ],
        "treatment": [
            "Spray copper-based fungicides mixed with mancozeb for maximum effectiveness.",
            "Prune lower infected branches to stop the upward splash of bacteria from the soil.",
            "Sanitize all gardening tools immediately after handling infected plants."
        ],
        "prevention": [
            "Use certified disease-free seeds and buy healthy transplants.",
            "Avoid sprinkler watering; use drip lines or water near the roots.",
            "Remove weeds and crop debris at the end of the season to prevent overwintering."
        ]
    },
    "tomato_early_blight": {
        "plant": "Tomato",
        "disease": "Early Blight",
        "scientific_name": "Alternaria solani",
        "symptoms": [
            "Concentric ring-like dark brown spots (target pattern) starting on older lower leaves.",
            "Yellowing of leaves around the dark spots, progressing upwards.",
            "Leathery dark spots on the stem near the soil line."
        ],
        "treatment": [
            "Apply organic bio-fungicides or chemical fungicides (chlorothalonil, copper soap).",
            "Prune off the bottom 12 inches of leaves to block soil splash and improve airflow.",
            "Keep plants well-fed; weak or stressed plants are highly susceptible."
        ],
        "prevention": [
            "Mulch the soil surface around plants to prevent fungal spores from splashing up.",
            "Water at the base of the plant in the morning so any splashed water evaporates quickly.",
            "Rotate crops so solanaceous plants are only grown in the same spot once every 3 years."
        ]
    },
    "tomato_late_blight": {
        "plant": "Tomato",
        "disease": "Late Blight",
        "scientific_name": "Phytophthora infestans",
        "symptoms": [
            "Large, dark, water-soaked oily spots on leaves that turn brown and crisp.",
            "A delicate white powdery/velvety mold on the undersides of infected leaves in damp conditions.",
            "Large, irregular greasy chocolate-brown spots on the tomato fruits themselves."
        ],
        "treatment": [
            "Apply copper-based fungicides at the absolute first sign of the disease.",
            "If infection is widespread, pull the entire plant out, bag it, and discard it to prevent spreading airborne spores.",
            "Do not compost infected tomato tissues, as the pathogen can overwinter."
        ],
        "prevention": [
            "Select late blight resistant tomato varieties (e.g., 'Mountain Magic', 'Defiant').",
            "Ensure wide spacing between tomatoes to speed up drying of leaves after rain.",
            "Avoid planting tomatoes near potatoes, as they easily share this aggressive disease."
        ]
    },
    "tomato_leaf_mold": {
        "plant": "Tomato",
        "disease": "Leaf Mold",
        "scientific_name": "Passalora fulva",
        "symptoms": [
            "Pale green or yellow spots on the upper surfaces of older leaves.",
            "An olive-green to grayish-brown velvety mold coating on the corresponding leaf undersides.",
            "Leaves curl, wither, and eventually die, though fruit is rarely infected directly."
        ],
        "treatment": [
            "Spray with copper fungicides or calcium chloride-based treatments.",
            "Aggressively prune lower leaves to maximize ventilation.",
            "In greenhouses, raise the temperature and lower humidity using fans."
        ],
        "prevention": [
            "Keep greenhouse relative humidity below 85%.",
            "Water early in the day directly to the soil, avoiding wet foliage overnight.",
            "Stake and prune tomatoes regularly to keep the inner canopy open and dry."
        ]
    },
    "tomato_septoria_leaf_spot": {
        "plant": "Tomato",
        "disease": "Septoria Leaf Spot",
        "scientific_name": "Septoria lycopersici",
        "symptoms": [
            "Numerous small, circular greyish spots with dark brown margins on leaves.",
            "Centers of the spots contain tiny black pinhead-like structures (fruiting bodies).",
            "Infections start on lower leaves, causing them to yellow, shrivel, and drop."
        ],
        "treatment": [
            "Apply copper fungicides, chlorothalonil, or sulfur dusts regularly.",
            "Carefully pluck infected leaves and discard them to slow the spread.",
            "Thoroughly clean boots and tools after working with infected crops."
        ],
        "prevention": [
            "Mulch heavily under the plants immediately after transplanting to isolate soil spores.",
            "Keep the garden bed completely free of weeds (some weeds like nightshade harbor the fungus).",
            "Clean up all plant residues in the autumn or bury them deep under the soil."
        ]
    },
    "tomato_spider_mites_two_spotted_spider_mite": {
        "plant": "Tomato",
        "disease": "Two-Spotted Spider Mites",
        "scientific_name": "Tetranychus urticae",
        "symptoms": [
            "Fine yellow, white, or bronze speckling (stippling) on the upper leaf surface.",
            "Extremely fine silky webbing on the undersides of leaves and at stem junctions.",
            "Leaves turn yellow, dry out, and take on a dull papery texture before dropping."
        ],
        "treatment": [
            "Spray infected plants with neem oil, horticultural oils, or insecticidal soaps.",
            "Introduce natural predators like ladybugs, lacewings, or predatory mites (Phytoseiulus persimilis).",
            "Blast the undersides of leaves with a firm stream of water to dislodge mites and destroy their webs."
        ],
        "prevention": [
            "Avoid dusty, dry conditions; keep plants well-watered as drought makes plants vulnerable.",
            "Avoid excessive nitrogen fertilizers, which stimulate tender, succulent growth that mites love.",
            "Isolate new plants before adding them to the garden."
        ]
    },
    "tomato_target_spot": {
        "plant": "Tomato",
        "disease": "Target Spot",
        "scientific_name": "Corynespora cassiicola",
        "symptoms": [
            "Small, brown, circular spots that develop light brown centers with concentric target-like rings.",
            "Unlike early blight, these spots are smaller, more numerous, and appear on leaves of all ages.",
            "Spots may merge, leading to extensive yellowing and defoliation."
        ],
        "treatment": [
            "Apply protective fungicides containing chlorothalonil, mancozeb, or copper compounds.",
            "Prune overlapping branches to improve sunlight penetration and air movement.",
            "Immediately remove severely damaged leaves."
        ],
        "prevention": [
            "Practice strict weed control, especially of solanaceous weeds.",
            "Avoid overhead watering; use drip lines or soaker hoses.",
            "Rotate tomatoes with crops that are not hosts (e.g., corn, grasses)."
        ]
    },
    "tomato_tomato_yellow_leaf_curl_virus": {
        "plant": "Tomato",
        "disease": "Yellow Leaf Curl Virus",
        "scientific_name": "Begomovirus (TYLCV)",
        "symptoms": [
            "Severe stunting of the overall plant growth, making it look bushy.",
            "Leaves cup, curl upwards and inwards, and are significantly smaller than normal.",
            "Leaf margins turn bright yellow, and flowers drop off before setting fruit."
        ],
        "treatment": [
            "There is no chemical cure for the virus itself. Pull out infected plants immediately to prevent spread.",
            "Control the virus vector (Silverleaf Whiteflies) using systemic insecticides or neem oil sprays.",
            "Dispose of infected plants by sealing them in plastic bags and putting them in trash."
        ],
        "prevention": [
            "Plant virus-resistant tomato cultivars.",
            "Use floating row covers to protect young seedlings from whiteflies until they are mature.",
            "Keep the vicinity clear of weed hosts like nightshade and wild mustard."
        ]
    },
    "tomato_tomato_mosaic_virus": {
        "plant": "Tomato",
        "disease": "Tomato Mosaic Virus",
        "scientific_name": "Tobamovirus (ToMV)",
        "symptoms": [
            "Mottled 'mosaic' pattern of alternating light green and dark green patches on leaves.",
            "Leaves may become distorted, blistered, crinkled, or narrow and 'fern-like'.",
            "Internal browning of the fruit walls (brown streaks on fruits)."
        ],
        "treatment": [
            "There is no cure or treatment. Immediately pull and burn or discard infected plants.",
            "Disinfect hands and tools with a 20% dry milk solution or trisodium phosphate when handling plants.",
            "Do not touch other healthy tomatoes after handling a suspect plant."
        ],
        "prevention": [
            "Always purchase certified virus-free seeds.",
            "Do not smoke or use tobacco products near tomato plants, as the virus can be carried on hands.",
            "Thoroughly clean and steam-sterilize soil and containers if re-using."
        ]
    },
    "tomato_healthy": {
        "plant": "Tomato",
        "disease": "Healthy",
        "scientific_name": "N/A",
        "symptoms": [
            "Vibrant, deep green foliage with sturdy, erect stems.",
            "Normal formation of blossoms, stems, and fruits without blemishes.",
            "No signs of mildew, spots, wilting, or insect webbing."
        ],
        "treatment": [
            "No chemical or therapeutic treatments needed.",
            "Provide regular feeding with a high-potassium tomato fertilizer once fruit sets."
        ],
        "prevention": [
            "Maintain a 2-inch layer of organic mulch to regulate soil moisture.",
            "Water deeply and consistently to prevent blossom end rot.",
            "Regularly inspect leaves to maintain perfect health."
        ]
    }
}

def normalize_name(name):
    """
    Normalizes class name to a simple standard key format: lowercase, alphanumeric characters,
    single underscores. Examples:
    'Tomato___Early_blight' -> 'tomato_early_blight'
    'Pepper__bell___healthy' -> 'pepper_bell_healthy'
    'Tomato_Spider_mites_Two_spotted_spider_mite' -> 'tomato_spider_mites_two_spotted_spider_mite'
    """
    if not name:
        return ""
    # Lowercase
    normalized = name.lower()
    # Replace any punctuation/underscores/spaces with single underscores
    normalized = re.sub(r'[^a-z0-9]', '_', normalized)
    # Remove consecutive underscores
    normalized = re.sub(r'_+', '_', normalized)
    # Strip leading/trailing underscores
    normalized = normalized.strip('_')
    
    # Map synonyms/variations to standard database keys
    # E.g., 'tomato_spider_mites_two_spotted_spider_mite' -> 'tomato_spider_mites_two_spotted_spider_mite'
    # Sometimes it's tomato_spider_mites_two_spotted_spider_mite, sometimes pepper_bell_healthy, etc.
    return normalized

def get_disease_details(class_name):
    """
    Retrieves disease information based on a raw directory or class name.
    If the name isn't directly matched, attempts fuzzy mapping using normalize_name.
    """
    norm_key = normalize_name(class_name)
    
    # Try exact match first on normalized keys
    if norm_key in DISEASE_DB:
        return DISEASE_DB[norm_key]
    
    # Fallback to fuzzy search (e.g. key in DB is a substring or vice versa)
    for db_key in DISEASE_DB:
        if db_key in norm_key or norm_key in db_key:
            return DISEASE_DB[db_key]
            
    # Substring matching for plant types if nothing fits
    plant_name = "Unknown Plant"
    if "tomato" in norm_key:
        plant_name = "Tomato"
    elif "potato" in norm_key:
        plant_name = "Potato"
    elif "pepper" in norm_key:
        plant_name = "Bell Pepper"
        
    # Default fallback
    return {
        "plant": plant_name,
        "disease": class_name.replace("_", " ").title(),
        "scientific_name": "N/A",
        "symptoms": ["General leaf spotting, discoloration, or wilting observed."],
        "treatment": ["Isolate the affected plant to prevent potential spread to neighbors.", "Apply a general organic bio-fungicide or neem oil spray as a safeguard."],
        "prevention": ["Maintain proper plant spacing and watering habits.", "Inspect foliage regularly for pests or structural abnormalities."]
    }
