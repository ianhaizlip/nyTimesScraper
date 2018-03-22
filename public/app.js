// Grab the articles as a json
$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    $("#articles").append(`
      <div class="card extraMargin"><div class="card-body article">
      <p data-id="${data[i]._id}"><span class="bold"> ${data[i].title} </span><br/> ${data[i].link} </p>
      <a type="button" class="btn btn-secondary noteButton" data-id="${data[i]._id}">Note</a>
      </div></div>`);
  }
});

//$('.noteButton').on("click", function() {

// Whenever someone clicks a p tag
$(document).click(".noteButton", function() {
  console.log('click');
  $("#notes").empty();
  var thisId = $(this).attr("data-id");

  // ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    .then(function(data) {
      console.log(data);
      $("#notes").append(`
        <div class="card extraMargin"><div class="card-body article">
        <h3>${data.title}</h3>
        <input id='titleinput' name='title' >
        <textarea id='bodyinput' name='body'></textarea>
        <br/>
        <a type="button" class="btn btn-secondary" data-id="${data._id}" id="savenote">Save Note</a>
        </div></div>`);

      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});

// savenote button
$(document).on("click", "#savenote", function() {
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .then(function(data) {
      console.log(data);
      $("#notes").empty();
    });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});
