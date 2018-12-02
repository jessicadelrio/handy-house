# Here go your api methods.

@auth.requires_signature()
def add_post():
    post_id = db.post.insert(
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(post_id=post_id))


def get_post_list():
    results = []
    if auth.user is None:
        # Not logged in.
        rows = db().select(db.post.ALL, orderby=~db.post.post_time)
        for row in rows:
            results.append(dict(
                id=row.id,
                post_title=row.post_title,
                post_content=row.post_content,
                post_author=row.post_author,
                thumb = None,
            ))
    else:
        # Logged in.
        rows = db().select(db.post.ALL, db.thumb.ALL, db.user_like.ALL,
                            left=[
                                db.thumb.on((db.thumb.post_id == db.post.id) & (db.thumb.user_email == auth.user.email)),
                                db.user_like.on((db.user_like.post_id == db.post.id) & (db.user_like.user_email == auth.user.email)),

                            ],
                            orderby=~db.post.post_time)
        for row in rows:
            results.append(dict(
                id=row.post.id,
                post_title=row.post.post_title,
                post_content=row.post.post_content,
                post_author=row.post.post_author,
                thumb = None if row.thumb.id is None else row.thumb.thumb_state,
                like=False if row.user_like.id is None else True,
            ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(post_list=results))



@auth.requires_signature()
def edit_post():
    post_id = int(request.vars.post_id)
    db.post.update_or_insert(
        (db.post.id == post_id) & (db.post.post_author == auth.user.email),
        post_title=request.vars.post_title,
        post_content=request.vars.post_content,
    )
    return "ok" # Might be useful in debugging.

# Replies
@auth.requires_signature()
def add_reply():
    reply_id = db.reply.insert(
        reply_title=request.vars.reply_title,
        reply_content=request.vars.reply_content,
        post_id=request.vars.post_id
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(reply_id=reply_id))


def get_reply_list():
    results = []
    post_id = request.vars.post_id
    print("post_id:", post_id)
    if auth.user is None:
        # Not logged in.
        rows = db(db.reply.post_id == post_id).select(db.reply.ALL, orderby=~db.reply.reply_time)
        # rows = db().select(db.reply.ALL, orderby=~db.reply.reply_time)

        for row in rows:
            results.append(dict(
                id=row.id,
                reply_title=row.reply_title,
                reply_content=row.reply_content,
                reply_author=row.reply_author,
                post_id=row.post_id

            ))
    else:
        # Logged in.
        rows = db(db.reply.post_id == post_id).select(db.reply.ALL,
                            orderby=~db.reply.reply_time)
        # rows = db().select(db.reply.ALL, orderby=~db.reply.reply_time)
        for row in rows:
            print(row)
            results.append(dict(
                id=row.id,
                reply_title=row.reply_title,
                reply_content=row.reply_content,
                reply_author=row.reply_author,
                post_id=row.post_id
            ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(reply_list=results))



@auth.requires_signature()
def edit_reply():
    reply_id = int(request.vars.reply_id)
    db.reply.update_or_insert(
        (db.reply.id == reply_id) & (db.reply.reply_author == auth.user.email),
        reply_title=request.vars.reply_title,
        reply_content=request.vars.reply_content,
    )
    return "ok" # Might be useful in debugging.


@auth.requires_signature()
def set_thumb():
    post_id = int(request.vars.post_id)
    thumb_state = request.vars.thumb
    db.thumb.update_or_insert(
        (db.thumb.post_id == post_id) & (db.thumb.user_email == auth.user.email),
        post_id=post_id,
        user_email=auth.user.email,
        thumb_state=thumb_state
    )
    return "ok" # Might be useful in debugging.

@auth.requires_signature()
def set_like():
    post_id = int(request.vars.post_id)
    like_status = request.vars.like.lower().startswith('t');
    if like_status:
        db.user_like.update_or_insert(
            (db.user_like.post_id == post_id) & (db.user_like.user_email == auth.user.email),
            post_id = post_id,
            user_email = auth.user.email
        )
    else:
        db((db.user_like.post_id == post_id) & (db.user_like.user_email == auth.user.email)).delete()
    return "ok" # Might be useful in debugging.
    
@auth.requires_signature()
def add_house():
    house_id = db.house.insert(
        house_name=request.vars.house_name,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(house_id=house_id))
    
@auth.requires_signature()
def add_hmember():
    hmember_id = db.hmember.insert(
        hmember_email=auth.user.email,
        house_id=request.vars.house_id,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(hmember_id=hmember_id))
    
    
    
    