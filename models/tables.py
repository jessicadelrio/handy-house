# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.




# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)


import datetime

def get_user_email():
    return None if auth.user is None else auth.user.email

def get_current_time():
    return datetime.datetime.utcnow()

db.define_table('house',
                Field('house_name'),
                )

db.define_table('hmember',
                Field('hmember_email', default=get_user_email()),
                Field('house_id', 'reference house'),
                )

db.define_table('chore',
                Field('chore_author', default=get_user_email()),
                Field('chore_content', 'text'),
                Field('house_id', 'reference house'),
                Field('chore_time', 'datetime', default=get_current_time()),
                )

db.define_table('post',
                Field('post_author', default=get_user_email()),
                Field('post_title'),
                Field('post_content', 'text'),
                Field('post_time', 'datetime', default=get_current_time()),
                )

db.define_table('reply',
                Field('reply_author', default=get_user_email()),
                Field('reply_title'),
                Field('reply_content', 'text'),
                Field('reply_time', 'datetime', default=get_current_time()),
                Field('post_id', 'reference post'),
                )

# Likes.
db.define_table('user_like',
                Field('user_email'), # The user who flagged
                Field('post_id', 'reference post'), # The flagged post
                )

# Thumbs
db.define_table('thumb',
                Field('user_email'), # The user who thumbed, easier to just write the email here.
                Field('post_id', 'reference post'), # The thumbed post
                Field('thumb_state'), # This can be 'u' for up or 'd' for down, or None for... None.
                )
