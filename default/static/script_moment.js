function get_personal_Feeds(){
    let user_id_element = document.getElementById("user-id");
    let user_id = user_id_element.textContent;
    // let user_id = '7802e93b-27cb-4f8b-b4a5-37f7844dd429';
    url = window.location.host;
    let api = 'https://' + url + '/v1_0/user_feeds/' + user_id;
    // let api = 'http://' + url + '/v1_0/user_feeds/' + user_id;
    console.log(user_id)
    fetch(api, {
        method: 'GET',
        headers: {
        'X-Api-Key': 'abcdef123456',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        }
    }).then((response) => response.json())
    .then(function(data) {
        console.log(data);
        let FeedsBox = document.getElementById("moments-container");
        let username_sidebar = document.getElementById("username-siderbar");
        for (i = 0; i < data.length; i++){
            let feed = data[i];
            let feed_id = feed['feed_id'];
            let images = feed['image_urls'];
            console.log(images)
            let image = ""
            if (images.length>0){
                image=images[0];
            }
            let text = feed['text'];
            let timestamp = feed['timestamp'];
            let user_id = feed['user_id'];
            let username = feed['username'];
            username_sidebar.innerHTML = username;
            let post = document.createElement('div');
            post.id = 'post';
            let avatorBox = document.createElement('div');
            avatorBox.id = 'post__avatar';
            var post_avatar = document.createElement('img');
            post_avatar.src = 'https://i.pinimg.com/originals/a6/58/32/a65832155622ac173337874f02b218fb.png';
            avatorBox.append(post_avatar)
            post.appendChild(avatorBox)

            let post__body = document.createElement('div');
            post__body.id = "post__body"
            let post__header = document.createElement('div');
            post__header.id = "post__header"
            let post__headerText = document.createElement('div');
            post__headerText.id = "post__headerText"
            let post__username = document.createElement('h3');
            post__username.innerHTML = username + '<span class="post__headerSpecial"><span class="material-icons post__badge"> verified </span>@' + username +'</span>';

            post__headerText.appendChild(post__username);
            post__header.appendChild(post__headerText)

            let post__headerDescription = document.createElement('div');
            post__headerDescription.id = "post__headerDescription"
            var contentText = document.createElement('p');
            contentText.innerHTML = text;
            post__headerDescription.append(contentText)
            post__header.appendChild(post__headerDescription)
            let post__headerTimestamp = document.createElement('div');
            post__headerTimestamp.id = "post__headerTimestamp"
            var timestampText = document.createElement('p');
            timestampText.innerHTML = timestamp;
            post__headerTimestamp.append(timestampText)
            post__header.appendChild(post__headerTimestamp)

            post__body.appendChild(post__header)

            var post_img = document.createElement('img');
            post_img.src = image;
            post__body.appendChild(post_img)

            let post__footer = document.createElement('div');
            post__footer.id = "post__footer";
            post__footer.innerHTML = '<span class="material-icons"> repeat </span><span class="material-icons"> favorite_border </span><span class="material-icons"> publish </span>'
            post__body.appendChild(post__footer)
            post.appendChild(post__body);
            FeedsBox.appendChild(post);
        }
    })
    return;
}
