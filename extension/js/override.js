function SettingsMenu() {
	var that = this;
	that.settingsData = {
		iconColor: "#fff",
		//backgroundImage: "",
	};


	that.init = function() {
		chrome.storage.local.get("settings", function(obj) {
			if (obj.settingsy != null) {
				that.settingsData = obj.settings;
			} else {
				that.saveSettings();
			}

			that.showSettings();
		});
	}
	that.saveSettings = function() {
		chrome.storage.local.set({"settings": that.settingsData}, function() {
			//settings saved
		});
	}
	that.showSettings = function() {
		$.each(that.settingsData, function(key, value) {
			$("#settings-" + key).find("span:nth-of-type(2)").text(value);
		});
	}
	
	that.init();
}

function ImageGallery() {
	var that = this;
	that.galleryData = [];
	that.galleryCode = $("#gallery");
	that.galleryImgs = that.galleryCode.find(".gallery-images");
	that.galleryLoaded = false;

	that.init = function() {
		$("a[href='#settings-gallery']").on("click", function() {
			chrome.storage.local.get("gallery", function(obj) {
				if (obj.gallery != null && !that.galleryLoaded) {
					Array.prototype.push.apply(that.galleryData, obj.gallery);
				}
				that.galleryLoaded = true;
				that.showGallery();
			});
		});
	};
	that.addImage = function(image, show) {
		that.galleryData.unshift({src: image});
		that.saveGallery(show);

	};
	that.removeImage = function(indexStart, range, show) {
		if (range == null) range = 1;
		that.galleryData.splice(indexStart, range);
		that.saveGallery(show);
	};
	that.moveImage = function() {

	};
	that.saveGallery = function(show) {
		if (!that.galleryLoaded) {
			chrome.storage.local.get("gallery", function(obj) {
				if (obj.gallery != null) {
					Array.prototype.push.apply(that.galleryData, obj.gallery);
				}
				that.galleryLoaded = true;

				chrome.storage.local.set({"gallery": that.galleryData}, function() {
					if (show) that.showGallery();
				});
			});
		} else {
			chrome.storage.local.set({"gallery": that.galleryData}, function() {
				if (show) that.showGallery();
			});
		}
		
	}
	that.setBackground = function(image) {
		chrome.storage.local.set({"background": image}, function() {
			$("body").css("background-image", "url(" + image + ")");
		});
	}
	that.showGallery = function() {
		that.galleryImgs.empty();

		for (var i = 0; i < that.galleryData.length; i++) {
			that.galleryImgs.append("<div class='gallery-img noselect'><div class='gallery-img-bkgd' style='background-image: url(" + that.galleryData[i].src + ");'/><div class='gallery-img-controls'><i class='material-icons btn-background'>photo_size_select_actual</i><i class='material-icons btn-settings'>settings</i><i class='material-icons btn-delete'>delete</i></div></div>");
		}

		$(".gallery-img .btn-background, .gallery-img .gallery-img-bkgd").on("click", function() {
			var src = $(this).closest(".gallery-img").find(".gallery-img-bkgd").css("background-image");
			src = src.replace('url(','').replace(')','').replace(/\"/gi, "");
			that.setBackground(src);
		});
		$(".gallery-img .btn-delete").on("click", function() {
			that.removeImage($(this).closest(".gallery-img").index(), 1, true);
		});

	}

	that.init();
}

function FileUploader(gallery) {
	var that = this;
	that.fileselect = $("#fileselect");
	that.filedrag = $("#filedrag");
	that.gallery = gallery;

	that.init = function() {


		// call initialization file
		if (window.File && window.FileList && window.FileReader) {
			// file select
			that.fileselect.on("change", that.fileSelectHandler);

			// is XHR2 available?
			var xhr = new XMLHttpRequest();
			if (xhr.upload) {
				// file drop
				that.filedrag.on("dragover", that.fileDragHover);
				that.filedrag.on("dragleave", that.fileDragHover);
				that.filedrag.on("drop", that.fileSelectHandler);
			}
		}
	};
	that.fileDragHover = function(e) {
		e.stopPropagation();
		e.preventDefault();
		if (e.type == "dragover") {
			that.filedrag.addClass("hover");
		} else {
			that.filedrag.removeClass("hover");
		}
	};
	that.fileSelectHandler = function(e) {
		// cancel event and hover styling
		that.fileDragHover(e);

		// fetch FileList object
		var files = e.target.files || e.originalEvent.dataTransfer.files || e.dataTransfer.files;

		// process all File objects
		for (var i = 0, f; f = files[i]; i++) {
			that.parseFile(f);
		}
	};
	that.parseFile = function(file) {
		var fr = new FileReader();
		fr.onload = function () {
			that.gallery.addImage(fr.result);
		}
		fr.readAsDataURL(file);
	};

	that.init();
}

function WidgetGallery() {
	var that = this;

}

chrome.storage.local.get("background", function(obj) {
	$("body").css("background-image", "url(" + obj.background + ")");
});

var settings = new SettingsMenu();
var gallery = new ImageGallery();
var uploader = new FileUploader(gallery);
var widgets = new WidgetGallery();