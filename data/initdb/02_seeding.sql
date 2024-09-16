BEGIN;

INSERT INTO 
  "admin" ("id", "username", "password_hash", "created_at", "updated_at") 
VALUES
  (1,	'Marion',	'$2a$10$jqSmzjF41LYFguGYjA.IX./3X0ZjnFuDhHZDu/5s95O.j8hXMEDr6',	'2024-09-03 09:12:04.416733+02',	NULL);

INSERT INTO 
  "carousel_picture" ("url", "created_at", "updated_at", "position") 
VALUES
  ('/images/carousel-1.png',	'2024-09-13 23:11:54.728+02',	'2024-09-13 23:12:14.098+02',	1),
  ('/images/carousel-2.png',	'2024-09-13 23:11:57.614+02',	'2024-09-13 23:12:14.098+02',	2),
  ('/images/carousel-3.png',	'2024-09-13 23:11:59.894+02',	'2024-09-13 23:12:14.098+02',	3),
  ('/images/carousel-4.png',	'2024-09-13 23:12:02.843+02',	'2024-09-13 23:12:14.098+02',	4),
  ('/images/carousel-5.png',	'2024-09-13 23:12:05.333+02',	'2024-09-13 23:12:14.098+02',	5),
  ('/images/carousel-6.png',	'2024-09-13 23:12:07.767+02',	'2024-09-13 23:12:14.098+02',	6);

INSERT INTO 
  "concert" ("city", "event_date", "venue", "event_name", "event_url", "created_at", "updated_at") 
VALUES
  ('Zürich',	'2024-09-06',	'Galotti Musikwerkstatt',	'',	'https://www.galotti.ch/story/freitag-6-9-24-bandnacht/',	'2024-09-10 20:43:29.068+02',	'2024-09-10 20:46:05.645+02'),
  ('Röthenbach Im Emmental',	'2024-07-20',	'',	'Vertanzt Festival',	'https://www.vertanzt.ch/',	'2024-09-10 20:44:36.653+02',	'2024-09-10 20:46:55.468+02');

INSERT INTO 
  "post" ("title_fr", "title_de", "content_fr", "content_de", "image_url", "created_at", "updated_at") 
  VALUES
  ('Merci Vertantzt !',	'Danke, Vertantzt !',	'C''était incroyable ! Merci pour votre formidable écoute ! On était ravies de vous présenter Noïta 👏
  À l''année prochaine !?!',	'Es war unglaublich! Danke für''s enthusiastische Zuhören! Wir haben uns mega gefreut, euch Noïta zu zeigen 👏
  Bis nächstes Jahr !?',	'/images/post-1.png',	'2024-07-22 23:05:19.261+02',	'2024-07-22 23:05:19.261+02'),
  ('Galotti Bandnacht, on arrive !',	'Galotti Bandnacht, wir kommen !',	'Répétition générale aujourd''hui, il fait chaud sous le Hardbrücke ! On vous prépare un set aux petits oignons et même un featuring surprise 🙂!
  Venetz !',	'Generalprobe heute. Es wird heisst unter der Hardbrücke ! Wir basteln euch ein mega cooles Set zusammen, sogar mit einem Überraschungs Featuring 🙂!
  Venetz !
  ',	'/images/post-2.png',	'2024-09-01 23:05:19.261+02',	'2024-09-01 23:05:19.261+02');

COMMIT;