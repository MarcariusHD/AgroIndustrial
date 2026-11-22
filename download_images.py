import os
import urllib.request
import time

base_dir = "d:/PRUEBA/mi-app/static/IMG"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

def download_image(filename, keyword, width=800, height=600):
    url = f"https://loremflickr.com/{width}/{height}/{keyword}"
    filepath = os.path.join(base_dir, f"{filename}.jpg")
    try:
        urllib.request.urlretrieve(url, filepath)
        print(f"Downloaded {filename}.jpg for keyword: {keyword}")
        time.sleep(1) # Be polite to the server
    except Exception as e:
        print(f"Failed to download {filename}: {e}")

images_to_download = [
    # Slides (Ruletas) - agricultores
    ("slide1", "farmer,agriculture"),
    ("slide2", "farmer,greenhouse"),
    ("slide3", "farmer,field"),
    
    # Phases
    ("cultivo1", "soil,compost"),
    ("cultivo2", "seedling,planting"),
    ("cultivo3", "planning,farm"),
    ("cultivo4", "irrigation,water"),

    # Crops (Primavera) - Plantas
    ("Tomate_Cherry", "cherry,tomato,plant"),
    ("lechuga_romana", "romaine,lettuce,plant"),
    ("fresas", "strawberry,plant"),
    ("zanahoria", "carrot,plant,leaves"),
    ("pimientos", "bell,pepper,plant"),
    ("guisantes", "peas,plant"),
    ("frambuesas", "raspberry,bush"),
    ("rabanos", "radish,plant"),
    ("espinacas", "spinach,plant"),
    ("arandanos", "blueberry,bush"),

    # Crops (Verano) - Plantas
    ("sandia", "watermelon,vine,plant"),
    ("maiz_dulce", "sweetcorn,plant,field"),
    ("melon", "melon,vine,plant"),
    ("calabacin", "zucchini,plant"),
    ("uvas", "grapes,vine,plant"),
    ("berenjena", "eggplant,plant"),
    ("ciruelas", "plum,tree"),
    ("judias_verdes", "green,bean,plant"),
    ("higos", "fig,tree"),
    ("pepino", "cucumber,vine,plant"),

    # Crops (Otono) - Plantas
    ("manzanas", "apple,tree"),
    ("calabaza", "pumpkin,plant"),
    ("peras", "pear,tree"),
    ("brocoli", "broccoli,plant"),
    ("granadas", "pomegranate,tree"),
    ("coliflor", "cauliflower,plant"),
    ("caquis", "persimmon,tree"),
    ("escarola", "endive,plant"),
    ("mandarinas", "mandarin,tree"),
    ("puerros", "leek,plant"),

    # Crops (Invierno) - Plantas
    ("naranjas", "orange,tree"),
    ("col_rizada", "kale,plant"),
    ("kiwis", "kiwi,vine,plant"),
    ("espinacas_invierno", "spinach,plant,winter"),
    ("limones", "lemon,tree"),
    ("remolacha", "beetroot,plant"),
    ("pomelos", "grapefruit,tree"),
    ("acelgas", "chard,plant"),
    ("chirimoyas", "cherimoya,tree"),
    ("alcachofas", "artichoke,plant"),

    # Pests - We can leave these as insects/pests
    ("pest_pulgon", "aphid,insect"),
    ("pest_arana_roja", "spidermite,insect"),
    ("pest_mosca_blanca", "whitefly,insect"),
    ("pest_oidio", "powdery,mildew"),
    ("pest_babosa", "slug,mollusk"),
    ("pest_mosca_zanahoria", "carrot,fly"),
    ("pest_gorgojo", "weevil,insect"),
    ("pest_pulguilla", "fleabeetle,insect"),
    ("pest_minador", "leafminer,insect"),
    ("pest_gusano_mazorca", "corn,earworm"),
    ("pest_mildiu", "downy,mildew"),
    ("pest_gusano_ciruela", "plum,moth"),
    ("pest_mosca_fruta", "fruitfly,insect"),
    ("pest_carpocapsa", "codling,moth"),
    ("pest_psila", "psylla,insect"),
    ("pest_oruga_col", "cabbage,caterpillar"),
    ("pest_cochinilla", "mealybug,insect"),
    ("pest_mosca_cebolla", "onion,fly"),
]

for filename, keyword in images_to_download:
    download_image(filename, keyword)
