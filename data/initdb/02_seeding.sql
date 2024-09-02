BEGIN;

INSERT INTO
  "carousel_picture" ("url")
VALUES
  ('https://via.placeholder.com/1920x1080?text=Carousel+Picture+1'),
  ('https://via.placeholder.com/1920x1080?text=Carousel+Picture+2'),
  ('https://via.placeholder.com/1920x1080?text=Carousel+Picture+3'),
  ('https://via.placeholder.com/1920x1080?text=Carousel+Picture+4'),
  ('https://via.placeholder.com/1920x1080?text=Carousel+Picture+5');

INSERT INTO
  "concert" ("city", "event_date", "venue", "event_name", "event_url")
VALUES
  ('Zurich', '2024-03-01', 'Venue 1', 'Event 1', 'https://www.example.com/event1'),
  ('Geneva', '2024-05-25', 'Venue 2', 'Event 2', 'https://www.example.com/event2'),
  ('Lausanne', '2024-09-07', 'Venue 3', 'Event 3', 'https://www.example.com/event3'),
  ('Basel', '2024-11-11', 'Venue 4', 'Event 4', 'https://www.example.com/event4');

INSERT INTO
  "post" ("title_fr", "title_de", "content_fr", "content_de", "image_url")
VALUES
  ('Titre 1', 'Title 1', 'Contenu 1', 'Content 1', 'https://via.placeholder.com/1920x1080?text=Post+1'),
  ('Titre 2', 'Title 2', 'Contenu 2', 'Content 2', 'https://via.placeholder.com/1920x1080?text=Post+2'),
  ('Titre 3', 'Title 3', 'Contenu 3', 'Content 3', 'https://via.placeholder.com/1920x1080?text=Post+3'),
  ('Titre 4', 'Title 4', 'Contenu 4', 'Content 4', 'https://via.placeholder.com/1920x1080?text=Post+4');

COMMIT;