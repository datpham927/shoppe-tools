const fetchTikTokVideo = async () => {
    const url = 'https://tikvid.io/api/ajaxSearch';
    const body = JSON.stringify({

    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });

        if (!response.ok) {
            console.error(`Lỗi HTTP! Mã trạng thái: ${response.status}`);
            return;
        }

        const result = await response.json();
        console.log('result', result);  // Kiểm tra dữ liệu trả về trong console

        const videoUrl = result?.data?.nowatermark;
        if (videoUrl) {
            const downloadLink = document.createElement("a");
            downloadLink.href = videoUrl;
            downloadLink.download = "tiktok-video.mp4";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } else {
            console.warn("Không tìm thấy link tải video!");
        }
    } catch (error) {
        console.error('Có lỗi xảy ra:', error);
    }
};

fetchTikTokVideo();
