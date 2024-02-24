const baseUrl = "http://44.204.66.45";

export const sendImageToApi = async (imageUri, lang) => {
    try {
        if (!imageUri) {
            throw new Error("No image provided");
        }

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        });

        const response = await fetch(`${baseUrl}/generate_image_description/?lang=${lang}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("An error has occurred");
        }
    } catch (error) {
        console.error("An error has occurred:", error);
        throw error;
    }
};

export const sendMessageToApi = async (lang, photo, prompt) => {
    try {
        const url = new URL(`${baseUrl}/chat_with_image/`);
        url.searchParams.append('prompt', prompt);
        url.searchParams.append('lang', lang);
        url.searchParams.append('photo', photo);

        const response = await fetch(url.toString(), {
            method: 'POST', 
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("An error has occurred");
        }
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

export const deleteImage = async (imageUri) => {
    try {
        const response = await fetch(`${baseUrl}/delete_image?photo=${imageUri}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("An error has occurred");
        }
    } catch (error) {
        console.error("Error while deleting image:", error);
        throw error;
    }
};

export async function sendTextToSpeechRequest(text) {
    const url = 'http://44.204.66.45/text_to_speech/?text=' + encodeURIComponent(text);
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
    };
  
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data?.result?.url;
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  
  
  