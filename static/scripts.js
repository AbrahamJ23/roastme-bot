var headerFinished = false;
var head_text = "starting roastbot...";
var com_text = "Waiting to see that face...";
var a = 0;
var x = 0;
var barCompleted = false;
var header = $("#comments-header h3");
var commentsList = $("#comments-list");
var chat_icon = $("#chat_icon");

chat_icon.hide(); // Hide the chat_icon initially

var header_interval = setInterval(function () {
  $('.blinking-cursor').remove();
  header.append(head_text[a]);
  header.append("<span class='blinking-cursor'>' '</span>");
  a++;
  if (a >= head_text.length) {
    
    
    setTimeout(function() {
          chat_icon.fadeIn();
        }, 1000);
    clearInterval(header_interval);
    $('.blinking-cursor').remove();

    setTimeout(function() {
      var comment_interval = setInterval(function () {
        if (x < com_text.length) {
          $('.blinking-cursor').remove();
          commentsList.append(com_text[x]);
          commentsList.append("<span class='blinking-cursor'>' '</span>");
          x++;
        }
      }, 100);
    }, 2000);

  }
}, 100);



let typing = false;

function haltFunction() {
  clearInterval(promptInterval);
  clearInterval(header_interval);
  clearTimeout(timeout)
  $("#comments-list").text("");
  if (typing) {
    clearTimeout(typing_time);
    typing = false;
  }
  if (isPrinting) {
    clearInterval(promptInterval);
    isPrinting = false;

  }
}

var isPrinting = false;

function startCommentPrinting() {
  clearInterval(header_interval);
  isPrinting = true;
  var commentsList = $("#comments-list");
  var prompts = ["This you?...Damn!", "Working my AI magic...", "Almost there...", "God this is hard..."];
  var currentPrompt = 0;
  var b = 0;
  function startPrinting() {
    if (b === 0) {
      commentsList.text("");
    }
    $('.blinking-cursor').remove();
    commentsList.append(prompts[currentPrompt][b]);
    commentsList.append("<span class='blinking-cursor'>| |</span>");
    b++;
    if (b >= prompts[currentPrompt].length) {
      clearInterval(promptInterval);
      currentPrompt++;
      b = 0;
      if (currentPrompt >= prompts.length) {
        currentPrompt = 0;
      }
      timeout = setTimeout(() => {
        promptInterval = setInterval(startPrinting, 100);
      }, 5000);
    }
  }
  promptInterval = setInterval(startPrinting, 25);
}


Dropzone.options.myDropzone = {
  url: '/',
  paramName: "image",
  // autoProcessQueue: false, // Disable Dropzone's automatic upload
  method: 'post',
  maxFiles: 1,
  addRemoveLinks: true,
  dictDefaultMessage: "Capture or upload a selfie to get roasted",
  acceptedFiles: "image/*",
  maxFilesize: 10,

  init: function () {

    this.on("maxfilesexceeded", function (file) {
      this.removeFile(file);
      this.submit();
    });

    this.on("addedfile", function (file) {

      // Perform any additional processing on the file here
      if (this.files.length > 1) {
        this.removeFile(this.files[0]);
        this.options.dictRemoveFile = "Remove";
        this.options.dictCancelUpload = "Cancel";
      }
      startCommentPrinting();
    });

    this.on("success", function (file, response) {

      console.log(response)
      data = response;
        
      haltFunction();
      if (data.fun_pass == "True") {
        document.getElementById("comments-list").scrollIntoView();
        var comments = data.comments;
        var match_path = data.match_img;
        comments = JSON.parse(comments);
        comments = comments.map(comment => comment.replace("[", "").replace("]", "").replace("\u2019", "'"));
        $("#comments-list").append("<br>");

        const showMatchLink = document.querySelector("#show_match_link");
        showMatchLink.style.display = "block";

        function typeComment(i, j) {
          typing = true;
          if (i < 5 && i < comments.length) {
            if (j < comments[i].length) {
              $('.blinking-cursor').remove();
              $("#comments-list").append(comments[i][j]);
              $("#comments-list").append("<span class='blinking-cursor'>' '</span>");
              var delay = Math.floor(Math.random() * 75) + 25;
              document.querySelector('.blinking-cursor').style.animationDelay = delay + 'ms';
              setTimeout(function () {
                typeComment(i, j + 1);
              }, delay);
            } else {
              $("#comments-list").append("<br>").append("<br>");
              typing_time = setTimeout(function () {
                typeComment(i + 1, 0);
              }, 500);
            }
          }
          typing = false;
        }

        document.getElementById("comments-list").scrollIntoView();
        typeComment(0, 0);

        $('frame').removeClass('hidden');
        $("#user-img").attr("src", data.user_img);

        
        const matchImg = document.querySelector("#match_img");
        showMatchLink.addEventListener("click", () => {
          // Set the source of the image to the URL of the match image
          matchImg.src = "static/match.jpg";
          // Display the image
          matchImg.style.display = "block";
        });

        
      }
      else if (data.fun_pass == "Cannot detect face") {
        $("#comments-list").text("");
        $("#toast-body").text("");
        document.getElementById("comments-list").scrollIntoView();
        comments = "Failed to detect face. Please try a different image";
        $("#comments-list").append("<br>");
        $("#comments").append(comments);
        $("#toast-body").append(comments);

        $('.toast').toast('show');
        setTimeout(function () {
          $('.toast').toast('hide');
        }, 5000);
      }
      else if (data.fun_pass == "Similarity not found") {
        $("#comments-list").text("");
        $("#toast-body").text("");
        document.getElementById("comments-list").scrollIntoView();
        comments = "Failed to find a match. Please try a different image";
        $("#comments-list").append("<br>");
        $("#comments").append(comments);
        $("#toast-body").append(comments);

        $('.toast').toast('show');
        setTimeout(function () {
          $('.toast').toast('hide');
        }, 5000);
      }
      else {

        $("#comments-list").text("");
        $("#toast-body").text("");

        document.getElementById("comments-list").scrollIntoView();
        comments = "That face giving me problems. Please try a different image"
        $("#comments-list").append("<br>");
        $("#comments-list").append(comments);
        $("#toast-body").append(comments);

        $('.toast').toast('show');
        setTimeout(function () {
          $('.toast').toast('hide');
        }, 5000);

      }
          
          
        });
      
    }

  }
