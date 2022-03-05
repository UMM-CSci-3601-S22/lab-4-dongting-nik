package umm3601.mongotest;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Projections.excludeId;
import static com.mongodb.client.model.Projections.fields;
import static com.mongodb.client.model.Projections.include;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;
import com.mongodb.client.model.Accumulators;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Sorts;

import org.bson.Document;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Some simple "tests" that demonstrate our ability to
 * connect to a Mongo database and run some basic queries
 * against it.
 * <p>
 * Note that none of these are actually tests of any of our
 * code; they are mostly demonstrations of the behavior of
 * the MongoDB Java libraries. Thus if they test anything,
 * they test that code, and perhaps our understanding of it.
 * <p>
 * To test "our" code we'd want the tests to confirm that
 * the behavior of methods in things like the TodoController
 * do the "right" thing.
 * <p>
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them names would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.
@SuppressWarnings({ "MagicNumber" })
public class TodoMongoSpec {

  private MongoCollection<Document> todoDocuments;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @BeforeAll
  public static void setupDB() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
      MongoClientSettings.builder()
      .applyToClusterSettings(builder ->
        builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
      .build());

    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  public void clearAndPopulateDB() {
    todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(
      new Document()
        .append("owner", "TestOne")
        .append("status", true)
        .append("body", "This is the test one")
        .append("category", "test one"));
    testTodos.add(
      new Document()
        .append("owner", "TestTwo")
        .append("status", true)
        .append("body", "This is the test two")
        .append("category", "test two"));
    testTodos.add(
      new Document()
        .append("owner", "TestThree")
        .append("status", false)
        .append("body", "This is the test three")
        .append("category", "test three"));

    todoDocuments.insertMany(testTodos);
  }

  private List<Document> intoList(MongoIterable<Document> documents) {
    List<Document> todos = new ArrayList<>();
    documents.into(todos);
    return todos;
  }

  private int countTodos(FindIterable<Document> documents) {
    List<Document> todos = intoList(documents);
    return todos.size();
  }

  @Test
  public void shouldBeThreeTodos() {
    FindIterable<Document> documents = todoDocuments.find();
    int numberOfTodos = countTodos(documents);
    assertEquals(3, numberOfTodos, "Should be 3 total todos");
  }

  @Test
  public void shouldBeOneTestOne() {
    FindIterable<Document> documents = todoDocuments.find(eq("owner", "TestOne"));
    int numberOfTodos = countTodos(documents);
    assertEquals(1, numberOfTodos, "Should be 1 TestOne");
  }

  // @Test
  // public void shouldBeTwoStatusWithTrue() {
  //   FindIterable<Document> documents = todoDocuments.find(gt("status", true));
  //   int numberOfTodos = countTodos(documents);
  //   assertEquals(2, numberOfTodos, "Should be 2 with true status");
  // }

  // @Test
  // public void statusWithTrueSortByOwner() {
  //   FindIterable<Document> documents
  //     = todoDocuments.find(gt("status", true))
  //     .sort(Sorts.ascending("owner"));
  //   List<Document> docs = intoList(documents);
  //   assertEquals(2, docs.size(), "Should be 2");
  //   assertEquals("TestOne", docs.get(0).get("owner"), "First should be TestOne");
  //   assertEquals("TestTwo", docs.get(1).get("owner"), "Second should be TestTwo");
  // }

  // @Test
  // public void falseWithOwnerNameIsTestThree() {
  //   FindIterable<Document> documents
  //     = todoDocuments.find(and(gt("status", false),
  //     eq("owner", "TestThree")));
  //   List<Document> docs = intoList(documents);
  //   assertEquals(1, docs.size(), "Should be 1");
  //   assertEquals("TestThree", docs.get(0).get("owner"), "First should be TestThree");
  // }

  @Test
  public void justOwnerAndCategory() {
    FindIterable<Document> documents
      = todoDocuments.find().projection(fields(include("owner", "category")));
    List<Document> docs = intoList(documents);
    assertEquals(3, docs.size(), "Should be 3");
    assertEquals("TestOne", docs.get(0).get("owner"), "First should be TestOne");
    assertNotNull(docs.get(0).get("category"), "First should have category");
    assertNull(docs.get(0).get("status"), "First shouldn't have 'status'");
    assertNotNull(docs.get(0).get("_id"), "First should have '_id'");
  }

  @Test
  public void justOwnerAndCategoryNoId() {
    FindIterable<Document> documents
      = todoDocuments.find()
      .projection(fields(include("owner", "category"), excludeId()));
    List<Document> docs = intoList(documents);
    assertEquals(3, docs.size(), "Should be 3");
    assertEquals("TestOne", docs.get(0).get("owner"), "First should be TestOne");
    assertNotNull(docs.get(0).get("category"), "First should have category");
    assertNull(docs.get(0).get("Status"), "First shouldn't have 'status'");
    assertNull(docs.get(0).get("_id"), "First should not have '_id'");
  }

  @Test
  public void justStatusAndCategoryNoIdSortedByOwner() {
    FindIterable<Document> documents
      = todoDocuments.find()
      .sort(Sorts.ascending("owner"))
      .projection(fields(include("status", "category"), excludeId()));
    List<Document> docs = intoList(documents);
    assertEquals(3, docs.size(), "Should be 3");
    assertEquals(true, docs.get(0).get("status"), "First should be True");
    assertNotNull(docs.get(0).get("category"), "First should have category");
    assertNull(docs.get(0).get("body"), "First shouldn't have 'body'");
    assertNull(docs.get(0).get("_id"), "First should not have '_id'");
  }

  @Test
  public void statusCounts() {
    AggregateIterable<Document> documents
      = todoDocuments.aggregate(
      Arrays.asList(
        /*
         * Groups data by the "age" field, and then counts
         * the number of documents with each given age.
         * This creates a new "constructed document" that
         * has "age" as it's "_id", and the count as the
         * "ageCount" field.
         */
        Aggregates.group("$status",
          Accumulators.sum("statusCount", 1)),
        Aggregates.sort(Sorts.ascending("_id"))
      )
    );
    List<Document> docs = intoList(documents);
    assertEquals(2, docs.size(), "Should be two status");
    assertEquals(false, docs.get(0).get("_id"));
    assertEquals(1, docs.get(0).get("statusCount"));
    assertEquals(true, docs.get(1).get("_id"));
    assertEquals(2, docs.get(1).get("statusCount"));
  }

}
