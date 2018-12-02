// This is the js for the default/index.html view.
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.add_post = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-post"));
        var sent_title = self.vue.form_title; // Makes a copy 
        var sent_content = self.vue.form_content; //
        $.post(add_post_url,
            // Data we are sending.
            {
                post_title: self.vue.form_title,
                post_content: self.vue.form_content
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-post"));
                // Clears the form.
                self.vue.form_title = "";
                self.vue.form_content = "";
                // Adds the post to the list of posts. 
                var new_post = {
                    id: data.post_id,
                    post_author: current_user_email,
                    post_title: sent_title,
                    post_content: sent_content
                };
                self.vue.post_list.unshift(new_post);
                // We re-enumerate the array.
                self.process_posts();
            });
        // If you put code here, it is run BEFORE the call comes back.
    };

    self.get_posts = function() {
        $.getJSON(get_post_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                console.log("post_list: ", data.post_list)
                self.vue.post_list = data.post_list;
                // Post-processing.
                self.process_posts();
                console.log("I got my list");
            }
        );
        console.log("I fired the get");
    };

    self.process_posts = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts. 
        // We add the _idx attribute to the posts. 
        enumerate(self.vue.post_list);
        // We initialize the smile status to match the like. 
        self.vue.post_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
            // The code below is commented out, as we don't have smiles any more. 
            // Replace it with the appropriate code for thumbs. 
            // // Did I like it? 
            // // If I do e._smile = e.like, then Vue won't see the changes to e._smile . 
             Vue.set(e, '_smile', e.like);
             Vue.set(e, '_current_thumb', e.thumb);
             Vue.set(e, 'editing', false);
             Vue.set(e, 'show_replies', false);
             Vue.set(e, 'show_reply_form', false);
        });
    };

    self.add_reply = function (post_idx) {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-reply"));
        var sent_reply_title = self.vue.reply_form_title; // Makes a copy
        var sent_reply_content = self.vue.reply_form_content; //
        var post_id = self.vue.post_list[post_idx].id
        $.post(add_reply_url,
            // Data we are sending.
            {
                reply_title: self.vue.reply_form_title,
                reply_content: self.vue.reply_form_content,
                post_id: post_id
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-reply"));
                // Clears the form.
                self.vue.reply_form_title = "";
                self.vue.reply_form_content = "";
                // Adds the post to the list of posts.
                var new_reply = {
                    id: data.reply_id,
                    reply_author: current_user_email,
                    reply_title: sent_reply_title,
                    reply_content: sent_reply_content,
                    post_id: post_id
                };
                self.vue.reply_list.unshift(new_reply);
                // We re-enumerate the array.
                self.process_replies();
            });
        // If you put code here, it is run BEFORE the call comes back.
    };

    self.get_replies = function(post_idx) {
        var post_id = self.vue.post_list[post_idx].id

        $.getJSON(get_reply_list_url,
            {
                post_id: post_id
            },
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of replies, all ready for display.
                console.log("reply_list: ", data.reply_list)
                self.vue.reply_list = data.reply_list;
                // Post-processing.
                self.process_replies();
                console.log("I got my reply list");
            }
        );
        console.log("I fired the reply get");
    };

    self.process_replies = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts.
        // We add the _idx attribute to the posts.
        enumerate(self.vue.reply_list);
        // We initialize the smile status to match the like.
        self.vue.reply_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Ovar post_id = self.vue.post_list[post_idx].idbject-Change-Detection-Caveats
             Vue.set(e, 'editing_reply', false);
        });
    };

    self.show_replies = function (post_idx) {
        var p = self.vue.post_list[post_idx];

        p.show_replies = !p.show_replies;
        if(p.show_replies) {
            self.get_replies(post_idx);
        }
    }

    self.show_reply_form = function (post_idx) {
        var p = self.vue.post_list[post_idx];

        p.show_reply_form = !p.show_reply_form;
    }

    self.edit_post = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        p.editing = true;
    }

    self.submit_edit_post = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        // Starts the spinner.
        $.post(edit_post_url,
            {
                post_id: p.id,
                post_title: p.post_title,
                post_content: p.post_content
            },
            function (data) {
//                self.process_posts();
            }
            );
        // Not here, the self.vue.title_save_pending = false;
    };

    self.end_edit_post = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        p.editing = false;
        // We send the title.
        self.submit_edit_post(post_idx);
    };

    self.edit_reply = function (reply_idx) {
        var r = self.vue.reply_list[reply_idx];
        r.editing_reply = true;
    }

    self.submit_edit_reply = function (reply_idx) {
        var r = self.vue.reply_list[reply_idx];
        // Starts the spinner.
        $.post(edit_reply_url,
            {
                reply_id: r.id,
                reply_title: r.reply_title,
                reply_content: r.reply_content
            },
            function (data) {
//                self.process_posts();
            }
            );
        // Not here, the self.vue.title_save_pending = false;
    };

    self.end_edit_reply = function (reply_idx) {
        var r = self.vue.reply_list[reply_idx];
        r.editing_reply = false;
        // We send the title.
        self.submit_edit_reply(reply_idx);
    };


    // Thumb change code.
    self.thumb_mouseout = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        p._current_thumb = p.thumb;
    };

    self.thumb_mouseover = function (post_idx, new_state) {
        var p = self.vue.post_list[post_idx];
        p._current_thumb = new_state;
    };

    self.thumb_click = function (post_idx, new_state) {
        var p = self.vue.post_list[post_idx];
        if(new_state != p.thumb){
            p.thumb = new_state;
        }
        else{ //if the thumb being clicked is what is already stored, set to null
            p.thumb = null;
        }
        $.post(set_thumb_url, {
            post_id: p.id,
            thumb: p.thumb
        }); // Nothing to do upon completion.
    };
    
    self.add_house = function () {
        var sent_name = self.vue.form_title; // Makes a copy 
        $.web2py.disableElement($("#add-house"));
        $.post(add_house_url,
            // Data we are sending.
            {
                house_name: self.vue.form_title,
                hmember_email: current_user_email
            },
            // What do we do when the post succeeds?
            function (data) {
            	$.web2py.enableElement($("#add-house"));
                // Clears the form.
                self.vue.form_title = "";
                // Adds the post to the list of posts. 
                var new_house = {
                    id: data.house_id,
                    house_name: sent_name,
                };
            });
        // If you put code here, it is run BEFORE the call comes back.
    };

    self.get_house = function() {
        $.getJSON(get_house_url,

            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                console.log("house_list: ", data.house_list)
                self.vue.house_list = data.house_list;
                // Post-processing.
//                self.process_posts(); I dont think we need this for a single house
                console.log("I got my list");
            }
        );
        console.log("I fired the get");
    };


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_content: "",
            post_list: [],
            reply_form_title: "",
            reply_form_content: "",
            reply_list: [],
            house_list: [],
            show_form: false,
        },
        methods: {
            add_post: self.add_post,

            thumb_mouseover: self.thumb_mouseover,
            thumb_mouseout: self.thumb_mouseout,
            thumb_click: self.thumb_click,

            toggle_form: function(){
                this.show_form = !this.show_form;
            },

            edit_post: self.edit_post,
            end_edit_post: self.end_edit_post,

            add_reply: self.add_reply,
            get_replies: self.get_replies,
            show_replies: self.show_replies,
            show_reply_form: self.show_reply_form,

            edit_reply: self.edit_reply,
            end_edit_reply: self.end_edit_reply,
            
            add_house: self.add_house,
            get_house: self.get_house,

        }

    });

    // If we are logged in, shows the form to add posts.
    if (is_logged_in) {
        $("#add_post").show();


    }

    // Gets the posts.
//    self.get_posts();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
