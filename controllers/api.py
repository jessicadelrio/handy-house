# Here go your api methods.

    
@auth.requires_signature()
def add_house():
    house_id = db.house.insert(
        house_name=request.vars.house_name,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(house_id=house_id))

# chores
@auth.requires_signature()
def add_chore():
    chore_id = db.chore.insert(
        chore_content=request.vars.chore_content,
        chore_assigneduser=request.vars.chore_assigneduser,
        chore_duedate=request.vars.chore_duedate,
        house_id=request.vars.house_id,
        chore_author=auth.user.email

    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(chore_id=chore_id))

def get_chore_list():
    thechores = []
    thehouse_id = request.vars.house_id

    if auth.user is None:
        # Not logged in.
        print "Not logged in."
    else:
        # Logged in.
        chores = db(db.chore.house_id == thehouse_id).select(db.chore.ALL,
                            orderby=~db.chore.chore_time)
        for chore in chores:
            thechores.append(dict(
                id=chore.id,
                house_id=chore.house_id,
                chore_content=chore.chore_content,
                chore_assigneduser=chore.chore_assigneduser,
                chore_duedate=chore.chore_duedate,
                chore_author=chore.chore_author
            ))

    # For homogeneity, we always return a dictionary.
    return response.json(dict(chore_list=thechores))

@auth.requires_signature()
def add_house():
    house_id = db.house.insert(
        house_name=request.vars.house_name,
    )
    hmember_id = db.hmember.insert(
        hmember_email=request.vars.hmember_email,
        house_id=house_id
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(house_id=house_id, hmember_id=hmember_id))

def get_house():
    themembers = []
    if auth.user is None:
        # do nothing
        print "You're not signed in"
    else:
        # Logged in.
        memberinfo = db(db.hmember.hmember_email == auth.user.email).select()

        for member in memberinfo:
            thehouseid = member.house_id
            houseinfo = None
            houses = db(db.house.id == thehouseid).select()
            for house in houses:
                houseinfo = house.house_name
            themembers.append(dict(
                email_name=member.hmember_email,
                house_id=member.house_id,
                house_name=houseinfo,
            ))
        # rows = db().select(db.house.ALL, orderby=~db.house.id)
        # for row in rows:
        #     results.append(dict(
        #         id=row.house.id,
        #         house_name=row.house.house_name,
        #     ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(house_list=themembers))

def is_in_house():
    themember = []
    checkmember = request.vars.hmember_email
    if auth.user is None:
        # do nothing
        print "You're not signed in"
    else:
        memberinfo = db(db.hmember.hmember_email == checkmember).select()
        for member in memberinfo:
            themember.append(dict(
                hmember_email=member.hmember_email,
            ))
    # For homogeneity, we always return a dictionary.
    return response.json(dict(check_member=themember))
	

@auth.requires_signature()
def add_hmember():
    hmember_id = db.hmember.insert(
        hmember_email=request.vars.hmember_email,
        house_id=request.vars.house_id,
    )
    # We return the id of the new post, so we can insert it along all the others.
    return response.json(dict(hmember_id=hmember_id))
    
@auth.requires_signature()
def edit_chore():
    chore_id = int(request.vars.chore_id)
    db.chore.update_or_insert(
        (db.chore.id == chore_id) & (db.chore.chore_author == auth.user.email),
        chore_content=request.vars.chore_content,
        chore_assigneduser=request.vars.chore_assigneduser,
        chore_duedate=request.vars.chore_duedate
    )
    return "ok" # Might be useful in debugging.
    
@auth.requires_signature()
def delete_chore():
    chore_id = int(request.vars.chore_id)
    db((db.chore.id == chore_id)).delete()
    return "ok" # Might be useful in debugging.
    
@auth.requires_signature()
def delete_hmember():
    hmember_id = int(request.vars.hmember_id)
    db((db.hmember.id == hmember_id)).delete()
    return "ok" # Might be useful in debugging.

def get_hmember_list():
    thehmembers = []
    thehouse_id = request.vars.house_id

    if auth.user is None:
        print "hi"
    else:
        # Logged in.
        hmembers = db(db.hmember.house_id == thehouse_id).select(db.hmember.ALL,
                            orderby=~db.hmember.id)
        for hmember in hmembers:
            thehmembers.append(dict(
                id=hmember.id,
                house_id=hmember.house_id,
                hmember_email=hmember.hmember_email,
            ))

    # For homogeneity, we always return a dictionary.
    return response.json(dict(hmember_list=thehmembers))


