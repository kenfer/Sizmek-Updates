 
KB_translations ={
  "list": {
    "newtab_link": {
      "title": "option on the article results to open it in a new browser tab",
      "value": "Open in a new tab"
    },
    "copylink_link": {
      "title": "option on the article results to link it into a comment",
      "value": "Copy Link in comment"
    },
    "preview_link": {
      "title": "option on the article result to preview article in a preview box",
      "value": "Preview article"
    }
  },
  "stop_words": {
    "title": "DO NOT TRANSLATE",
    "value": "a, about, above, across, after, again, against, all, almost, alone, along, already, also, although, always, am, among, an, and, another, any, anybody, anyone, anything, anywhere, are, area, areas, aren't, around, as, ask, asked, asking, asks, at, away, b, back, backed, backing, backs, be, became, because, become, becomes, been, before, began, behind, being, beings, below, best, better, between, big, both, but, by, c, came, can, cannot, can't, case, cases, certain, certainly, clear, clearly, come, could, couldn't, d, did, didn't, differ, different, differently, do, does, doesn't, doing, done, don't, down, downed, downing, downs, during, e, each, early, either, end, ended, ending, ends, enough, even, evenly, ever, every, everybody, everyone, everything, everywhere, f, face, faces, fact, facts, far, felt, few, find, finds, first, for, four, from, full, fully, further, furthered, furthering, furthers, g, gave, general, generally, get, gets, give, given, gives, go, going, good, goods, got, great, greater, greatest, group, grouped, grouping, groups, h, had, hadn't, has, hasn't, have, haven't, having, he, he'd, he'll, her, here, here's, hers, herself, he's, high, higher, highest, him, himself, his, how, however, how's, i, i'd, if, i'll, i'm, important, in, interest, interested, interesting, interests, into, is, isn't, it, its, it's, itself, i've, j, just, k, keep, keeps, kind, knew, know, known, knows, l, large, largely, last, later, latest, least, less, let, lets, let's, like, likely, long, longer, longest, m, made, make, making, man, many, may, me, member, members, men, might, more, most, mostly, mr, mrs, much, must, mustn't, my, myself, n, necessary, need, needed, needing, needs, never, new, newer, newest, next, no, nobody, non, noone, nor, not, nothing, now, nowhere, number, numbers, o, of, off, often, old, older, oldest, on, once, one, only, open, opened, opening, opens, or, order, ordered, ordering, orders, other, others, ought, our, ours, ourselves, out, over, own, p, part, parted, parting, parts, per, perhaps, place, places, point, pointed, pointing, points, possible, present, presented, presenting, presents, problem, problems, put, puts, q, quite, r, rather, really, right, room, rooms, s, said, same, saw, say, says, second, seconds, see, seem, seemed, seeming, seems, sees, several, shall, shan't, she, she'd, she'll, she's, should, shouldn't, show, showed, showing, shows, side, sides, since, small, smaller, smallest, so, some, somebody, someone, something, somewhere, state, states, still, such, sure, t, take, taken, than, that, that's, the, their, theirs, them, themselves, then, there, therefore, there's, these, they, they'd, they'll, they're, they've, thing, things, think, thinks, this, those, though, thought, thoughts, three, through, thus, to, today, together, too, took, toward, turn, turned, turning, turns, two, u, under, until, up, upon, us, use, used, uses, v, very, w, want, wanted, wanting, wants, was, wasn't, way, ways, we, we'd, well, we'll, wells, went, were, we're, weren't, we've, what, what's, when, when's, where, where's, whether, which, while, who, whole, whom, who's, whose, why, why's, will, with, within, without, won't, work, worked, working, works, would, wouldn't, x, y, year, years, yes, yet, you, you'd, you'll, young, younger, youngest, your, you're, yours, yourself, yourselves, you've, z"
  },
  "no_entries": {
    "title": "Placeholder when there are no suggestions for the ticket",
    "value": ""
  },
  "no_subject": {
    "title": "placeholder for when there is no subject yet on the ticket",
    "value": "Waiting for a subject to be defined..."
  },
  "help_text": {
    "title": "instructions for the add to comment button",
    "value": "Click the link to add it to the comment:"
  },
  "spinner": {
    "title": "Loading text",
    "value": "loading"
  },
  "agents_only": {
    "title": "label appearing on private articles, this is a tag to show that this article is private",
    "value": "Private"
  },
  "private_content_notice": {
    "title": "Notice message displayed in modal preview for private content",
    "value": "End-users will not be able to access this content."
  },
  "modal": {
    "close": {
      "title": "Close button on the modal",
      "value": "Close"
    },
    "copy": {
      "title": "Adding article to the comment, this is a button",
      "value": "Add to comment"
    }
  }
}

KB_settings ={
"include_title": false,
"name": "KB Suggestions",
"title": "KB Suggestions",
"nb_entries": "8",
"search_hc": true,
"exclude_agent_only": false,
"custom_host": null
}


function renderTemplate(tmp){
   var sFrm='', str=template[tmp];
    if(template[tmp].indexOf("{{iframe \"about:blank\"}}")>-1){
      var s= fmt("origin=%@&app_guid=%@", encodeURIComponent(currentAccont.baseURL), client._appGuid);
      var sFrm = '<iframe src="https://www.zendesk.com/wall/?'+s+'"></iframe>';
      var str=template[tmp].replace(/{{iframe \"about:blank\"}}/g, sFrm)
    }
    var html =jQuery.parseHTML(str, '', true)
    return html
}    


function fmt(t, e) {
    for (var n = arguments.length, r = Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
        r[i - 2] = arguments[i];
    var o = e;
    (!$.isArray(o) ||arguments.length > 2) && (o = [e].concat(r));
        var a = 0;
        return t.replace(/%@([0-9]+)?/g, function(t, e) {
        return e = e ? parseInt(e, 10) - 1 : a++, t = o[e], null === t ? "(null)" : void 0 === t ? "" : typeof(t.toString)=="function" ? t.toString() : t
    })
}