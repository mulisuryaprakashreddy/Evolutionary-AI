from tkinter import *
from tkinter import filedialog
import os
import tkinter as tk
from PIL import Image, ImageTk
from keras.models import load_model
from PIL import Image, ImageOps
import numpy as np
from keras.utils import load_img, img_to_array
from numpy import asarray
import numpy as np

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

# Load the model
model = load_model("keras_model.h5", compile=False)

# Load the labels
class_names = open("labels.txt", "r").readlines()

# Create the array of the right shape to feed into the keras model
data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)


def showImage():
    global fln
    l.config(text="")
    fln = filedialog.askopenfilename(initialdir=os.getcwd(), title="Select Image", filetypes=(("JPG", "*.jpg"), ("JPEG", "*.jpeg")))
    img = Image.open(fln).convert("RGB")
    im1 = img
    im1 = im1.save("pred.jpg")
    img = img.resize((300, 300), Image.Resampling.LANCZOS)
    img = ImageTk.PhotoImage(img)
    lbl.configure(image=img)
    lbl.place(relx=0.3, rely=0.1)
    lbl.image = img


def predict():
    global fln
    im2 = Image.open(fln).convert("RGB")
    image_array = np.asarray(im2)
    normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1
    data[0] = normalized_image_array
    prediction = model.predict(data)
    index = np.argmax(prediction)
    class_name = class_names[index]
    confidence_score = prediction[0][index]
    print("Class:", class_name[2:], end="")
    print("Confidence Score:", confidence_score)
    l.config(text="Prediction:" + class_name)
    if index != 0 and index != 1 and index != 2 and index != 3:
        l.config(text="Prediction:" + "others")
    return True


root = Tk()
frm = Frame(root)
frm.pack(side=BOTTOM, padx=80, pady=80)
lbl = Label(root)
lbl.pack()
title = Label(root, text="Detection of Cardiovascular Diseases in ECG images Using DL(CNN)", fg='#f00', font='Helvetica 18 bold').place(x=15, y=20)
btn = Button(frm, text="Select", command=showImage, height=5, width=10, fg='BLUE', bg='YELLOW')
btn.pack(side=tk.LEFT, padx=30, pady=30)
btn1 = Button(frm, text="Predict", command=predict, height=5, width=10, fg='BLUE', bg='YELLOW')
btn1.pack(side=tk.LEFT, padx=30, pady=30)
l = Label(root)
l.config(font=("Courier", 14))
l.place(relx=0.2, rely=0.7, anchor='sw')
l.pack(side=BOTTOM)
root.title("Cardiovascular disease prediction")
root.geometry("800x800")
root.mainloop()
