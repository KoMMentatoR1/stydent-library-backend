import pandas as pd
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def parse_string(string):
    if(type(string) == str):
      string = string.strip('[]')
      string_list = eval(string)
      if(type(string_list) == str):
        return [string_list]
      else:
        return string_list
    else:
       return string
    

count = 0

def migrate(books, users):
  def book_to_db(x):
    book_data = {
      'title': x.title,
      'description': x.description,
      'authors': x.authors,
      'image': x.image,
      'previewLink': x.previewLink,
      'publisher': x.publisher,
      'infoLink': x.infoLink,
      'categories': x.categories,
      'ratingsCount': x.ratingsCount,
    }
    books.insert_one(book_data)  

  booksData = pd.read_csv('books_data.csv')
  booksData.dropna(subset=['description'], inplace=True)
  data = booksData.loc[0:10000]
  data['authors'] =  data['authors'].apply(parse_string)
  data['categories'] =  data['categories'].apply(parse_string)
  data = data.rename(columns={
      "Title": 'title',
  })

  users.insert_one({'email': 'admin', 'password': hash_password('admin')})

  data.apply(book_to_db, axis=1)