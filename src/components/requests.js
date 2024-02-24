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

const convertTextToAudio = async (text) => {
    const url = "https://mohir.ai/api/v1/tts";
    const apiKey = "d6551223-d914-4488-ad8c-050268b8d535:1fc2f5fb-5635-45ed-a43f-dfe1091bd43a";

    const data = JSON.stringify({
      "text": `${text}`,
      "model": "davron",
      "mood": "neutral",
      "blocking": true,
      "webhook_notification_url": ""
    });

    const headers = {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: data
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        const audioUrl = jsonResponse.result.url;
        return audioUrl;
      } else {
        console.error('Failed to convert text to audio. Status code:', response.status);
      }
    } catch (error) {
      console.error('Error converting text to audio:', error);
    }
  };