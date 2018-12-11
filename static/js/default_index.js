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

    
    self.add_chore = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-chore"));
        var sent_chore_content = self.vue.chore_form_content;
        var sent_chore_assigneduser = self.vue.chore_form_assigneduser;
        var sent_chore_duedate = self.vue.chore_form_duedate;
        var house_id = self.vue.house_list[0].house_id;
        $.post(add_chore_url,
            // Data we are sending.
            {
                chore_content: self.vue.chore_form_content,
                chore_assigneduser: self.vue.chore_form_assigneduser,
                chore_duedate: self.vue.chore_form_duedate,
                house_id: house_id
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-chore"));
                // Clears the form.
                self.vue.chore_form_content = "";
                self.vue.chore_form_assigneduser = "";
                self.vue.chore_form_duedate = "";
                // Adds the post to the list of posts.
                var new_chore = {
                    id: data.chore_id,
                    chore_content: sent_chore_content,
                    chore_assigneduser: sent_chore_assigneduser,
                    chore_duedate: sent_chore_duedate,
                    house_id: house_id,
                    chore_author: current_user_email,
                };
                self.vue.chore_list.unshift(new_chore);
                // We re-enumerate the array.

                self.process_chores();
                self.get_chore_list(house_id);

            });
        // If you put code here, it is run BEFORE the call comes back.
    };
    
    self.is_in_house = function () {
        var sent_hmember_content = self.vue.hmember_form_content; 
      
        $.getJSON(is_in_house_url,
            {
                hmember_email: self.vue.hmember_form_content,
            },
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of replies, all ready for display.
               
                self.vue.check_member = data.check_member;
                console.log("tell me the json", self.vue.check_member);
                if(self.vue.check_member.length!==0){
                   	alert("This user is already in a house!");
                }
                else{
                	  self.add_hmember();
                }
                // Post-processing.
            }
        );
        console.log("tell me the json", self.vue.check_member);
    };
    
    self.add_hmember = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-hmember"));
        var sent_hmember_content = self.vue.hmember_form_content; 
        var house_id = self.vue.house_list[0].house_id;
        $.post(add_hmember_url,
            // Data we are sending.
            {
                hmember_email: self.vue.hmember_form_content,
                house_id: house_id
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-hmember"));
                // Clears the form.
                self.vue.hmember_form_content = "";
                // Adds the post to the list of posts.
                var new_hmember = {
                    id: data.hmember_id,
                    hmember_email: sent_hmember_content,
                    house_id: house_id
                };
                self.vue.hmember_list.unshift(new_hmember);
                // We re-enumerate the array.

                self.process_hmembers();
            });
        // If you put code here, it is run BEFORE the call comes back.
    };
    
    self.process_hmembers = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts.
        // We add the _idx attribute to the posts.
        enumerate(self.vue.hmember_list);
        // We initialize the smile status to match the like.
        self.vue.hmember_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
             //Vue.set(e, 'editing_chore', false);
        });
    };
    
    //getting the chore list
    self.get_chore_list = function(houseid) {
        var house_id = houseid;

        $.getJSON(get_chore_list_url,
            {
                house_id: house_id
            },
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of replies, all ready for display.
                console.log("chore_list: ", data.chore_list)
                self.vue.chore_list = data.chore_list;
                // Post-processing.
                self.process_chores();
                console.log("I got my chore list");
            }
        );
        console.log("I fired the reply get");
    };

    self.process_chores = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts.
        // We add the _idx attribute to the posts.
        enumerate(self.vue.chore_list);
        // We initialize the smile status to match the like.
        self.vue.chore_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
             Vue.set(e, 'editing_chore', false);
        });
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

                self.get_house();
            });
        // If you put code here, it is run BEFORE the call comes back.
    };
    
    self.get_house = function() {
        $.getJSON(get_house_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.

                self.vue.house_list = data.house_list;

                // Post-processing.
                if(data.house_list.length!==0){
                    self.get_chore_list(data.house_list[0].house_id);
                    self.get_hmember_list(self.vue.house_list[0].house_id);
                }

            }
        );
        console.log("I fired the get");
    };
    
    self.edit_chore = function (choreid) {
        var r = self.vue.chore_list[choreid];
        r.editing_chore = true;
    }
    
    self.submit_edit_chore = function (choreid) {
        var r = self.vue.chore_list[choreid];
        // Starts the spinner.
        $.post(edit_chore_url,
            {
                chore_id: r.id,
                chore_content: r.chore_content,
                chore_assigneduser: r.chore_assigneduser,
                chore_duedate: r.chore_duedate
            },
         );
        // Not here, the self.vue.title_save_pending = false;
    };

    self.end_edit_chore = function (choreid) {
        var r = self.vue.chore_list[choreid];
        r.editing_chore = false;
        // We send the title.
        self.submit_edit_chore(choreid);
    };
    
    self.delete_chore = function (choreid) {
    	var r = self.vue.chore_list[choreid];
    	var house_id = self.vue.house_list[0].house_id;
    	$.post(delete_chore_url,
         {
            chore_id: r.id,
            chore_content: r.chore_content,
            chore_assigneduser: r.chore_assigneduser,
            chore_duedate: r.chore_duedate,
         },
         function(data){
         	self.get_chore_list(house_id);
         });
      
    };
    
    self.delete_hmember = function (hmemberid) {
    	var r = self.vue.hmember_list[hmemberid];
    	var house_id = self.vue.house_list[0].house_id;
    	$.post(delete_hmember_url,
         {
            hmember_id: r.id,
            hmember_house: r.hmember_house,
            hmember_email: r.hmember_email,

         },
         function(data){
         	self.get_house();
         	console.log("chore list:",self.vue.chore_list);
         	self.vue.chore_list = [];
         	self.vue.hmember_list = [];
         }
      );
    };
    
    self.process_hmembers = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts.
        // We add the _idx attribute to the posts.
        enumerate(self.vue.hmember_list);
        // We initialize the smile status to match the like.
        self.vue.hmember_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
        });
    };
    
    self.get_hmember_list = function(houseid) {
        var house_id = houseid;

        $.getJSON(get_hmember_list_url,
            {
                house_id: house_id
            },
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of replies, all ready for display.
                console.log("hmember_list: ", data.hmember_list)
                self.vue.hmember_list = data.hmember_list;
                // Post-processing.
                self.process_hmembers();
                console.log("I got my hmember list");
            }
        );
        console.log("I fired the hmember get");
    };

//     self.process_house = function() {
//        // This function is used to post-process posts, after the list has been modified
//        // or after we have gotten new posts.
//        // We add the _idx attribute to the posts.
//        enumerate(self.vue.house_list);
//        console.log(self.vue.house_list);
//        // We initialize the smile status to match the like.
//        self.vue.house_list.map(function (e) {
//            // I need to use Vue.set here, because I am adding a new watched attribute
//            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
//            // The code below is commented out, as we don't have smiles any more.
//            // Replace it with the appropriate code for thumbs.
//            // // Did I like it?
//            // // If I do e._smile = e.like, then Vue won't see the changes to e._smile .
//
//        });
//    };



    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_content: "",
            house_list:[],
            chore_list:[],
            hmember_list:[],
            check_member:[],
            reply_form_title: "",
            reply_form_content: "",
            chore_form_content: "",
            chore_form_assigneduser: "",
            chore_form_duedate: "",
            hmember_form_content:"",
            show_form: false,
            chore_form: false,
            hmember_form: false,
            thehouse: false,

        },
        methods: {
            toggle_chore: function(){
                this.chore_form = !this.chore_form;
            },
            toggle_form: function(){
                this.show_form = !this.show_form;
            },
            toggle_hmember: function(){
                this.hmember_form = !this.hmember_form;
            },
            
            add_house: self.add_house,
            get_chore_list: self.get_chore_list,
            add_chore: self.add_chore,
            get_house: self.get_house,
            add_hmember: self.add_hmember,
            delete_hmember: self.delete_hmember,
            get_hmember_list: self.get_hmember_list,
            
            edit_chore: self.edit_chore,
            end_edit_chore: self.end_edit_chore,
            delete_chore: self.delete_chore,
            is_in_house: self.is_in_house,
        }

    });

    // If we are logged in, shows the form to add posts.
    if (is_logged_in) {

        $("#add_house").show();
        self.get_house();

    }

    // Gets the posts.
    //self.get_posts();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
