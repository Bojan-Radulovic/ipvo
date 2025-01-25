import torchvision
from torch import nn
import torch
import torchvision.transforms as transforms
from PIL import Image



class MultimodalClassifier(nn.Module):
    def __init__(self, text_vocab_size, text_embedding_dim, text_seq_length, num_classes):
        super(MultimodalClassifier, self).__init__()

        # Image model (ResNet50)
        self.image_model = torchvision.models.resnet50(weights=torchvision.models.ResNet50_Weights.DEFAULT)
        for param in self.image_model.parameters():
            param.requires_grad = False
        self.image_model.fc = nn.Linear(2048, 512)

        # Text model
        self.text_embedding = nn.Embedding(text_vocab_size, text_embedding_dim)
        self.text_conv = nn.Conv1d(in_channels=text_embedding_dim, out_channels=256, kernel_size=5, padding=2)
        self.text_lstm = nn.LSTM(input_size=256, hidden_size=256, batch_first=True, bidirectional=True)
        self.text_fc = nn.Linear(512, 512)

        # Combined classifier
        self.fc = nn.Sequential(
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )

    def forward(self, image, text):
        # Image branch
        image_features = self.image_model(image)
    
        # Text branch
        text_embedded = self.text_embedding(text)
        text_embedded = text_embedded.permute(0, 2, 1)
    
        # Apply the convolution
        text_conv_out = self.text_conv(text_embedded)
        
        # Apply LSTM
        text_features, _ = self.text_lstm(text_conv_out)
        text_features = self.text_fc(text_features[:, -1, :])
    
        # Combine features
        combined_features = torch.cat((image_features, text_features), dim=1)
        return self.fc(combined_features)
    
def build_tokenizer_and_vocab(descriptions, vocab_size):
    from collections import Counter
    global text_tokenizer, word_index
    tokenizer = Counter()
    for desc in descriptions:
        tokenizer.update(desc.lower().split())
    most_common = tokenizer.most_common(vocab_size - 1)
    text_tokenizer = {word: i + 1 for i, (word, _) in enumerate(most_common)}
    word_index = {word: i + 1 for i, (word, _) in enumerate(most_common)}

def tokenize_text(description, max_length):
    global text_tokenizer
    tokens = [text_tokenizer.get(word, 0) for word in description.lower().split()]
    if len(tokens) < max_length:
        tokens += [0] * (max_length - len(tokens))
    return tokens[:max_length]

# Inference function
def predict(image_path=None, text=None, model=None, device=None, categories=None):
    image_tensor = None
    text_tensor = None
    
    # If the image is provided, load and transform it
    if image_path:
        try:
            image = Image.open(image_path).convert("RGB")
        except FileNotFoundError:
            print(f"Image not found: {image_path}")
            return None
        image_tensor = image_transform(image).unsqueeze(0).to(device)  # Add batch dimension and move to device
    
    # If the text is provided, tokenize it
    if text:
        text_tokens = tokenize_text(text, MAX_LENGTH)
        text_tensor = torch.tensor(text_tokens).unsqueeze(0).to(device).long()  # Ensure it's Long for text input
    
    # Forward pass through the model
    with torch.no_grad():
        if image_tensor is not None and text_tensor is not None:
            output = model(image_tensor, text_tensor)
        elif image_tensor is not None:  # Only image input
            output = model(image_tensor, torch.zeros(1, MAX_LENGTH).to(device).long())  # Dummy tensor for text (Long type)
        elif text_tensor is not None:  # Only text input
            output = model(torch.zeros(1, 3, 224, 224).to(device).float(), text_tensor)  # Dummy tensor for image (Float type)
        else:
            print("Both image and text are missing.")
            return None

        _, predicted_class = torch.max(output, 1)
    
    # Get the class name from the index
    predicted_class_name = categories[predicted_class.item()]
    
    return predicted_class_name

device = "cuda" if torch.cuda.is_available() else "cpu"
print(device)

image_categories = ['amazon home', 'automotive', 'baby', 'pet supplies', 'sports & outdoors']
print(f"Categories: {image_categories}")

VOCAB_SIZE = 10000
MAX_LENGTH = 256

text_tokenizer = {}
word_index = {}

# Parameters
text_vocab_size = VOCAB_SIZE
text_embedding_dim = 128
text_seq_length = MAX_LENGTH
num_classes = len(image_categories)

# Inference

# load saved model from file
save_path = './models/multimodal_classifier_10.pth'
model = MultimodalClassifier(text_vocab_size, text_embedding_dim, text_seq_length, num_classes).to(device)
model.load_state_dict(torch.load(save_path, map_location=torch.device('cpu')))

# Preprocessing function for the image
image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.CenterCrop(224),
    transforms.ToTensor()
])

print("-------------Classifier loadan!-----------------")
