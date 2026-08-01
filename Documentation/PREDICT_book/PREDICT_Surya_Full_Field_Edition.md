**PREDICT**

*One Word, Two Roads, and the Ocean Behind Both*

Expanded Field Edition

*with deep technical notes on how I build AI and how I use AI*

**SURYA**

Expanded Edition

PREDICT: One Word, Two Roads, and the Ocean Behind Both --- Expanded
Field Edition

Copyright © 2026 by Surya. All rights reserved.

No part of this publication may be reproduced, distributed, or
transmitted in any form without prior written permission of the author,
except brief quotations in critical reviews.

*This is a work of creative nonfiction reflecting the author\'s personal
recollections, learning process, and technical understanding at the time
of writing. Every formula, mechanism, and workflow described here is
written the way I actually worked through it --- first person, in the
order I actually learned it --- so this book doubles as a field manual
for building AI systems and a field manual for using them.*

*For everyone still standing at the base of the mountain, wondering
whether to climb.*

**CONTENTS**

Prologue --- The Night I Stopped Sleeping Right

PART ONE --- The Ladder: How I Learned to Build It

I. The Lie of Simplicity

II\. The Word Underneath Everything

III\. The Ladder --- How Prediction Learned to Walk (with the full
prehistory: Markov, Shannon's n-grams, Turing, Dartmouth, the
Perceptron, symbolic AI, and both AI winters)

III½. What Actually Happens Inside the Sentence

PART TWO --- The Road: How I Learned to Use It, and Do the Magic

IV\. The Other Side of the Coin

IV½. Three Things Nobody Told Me Early Enough

V. The Evolution of Using AI

V½. Building the Business Analyst --- My Break-Even Calculator, Rung by
Rung

VI\. Two Roads, One Traveler

VI½. The Toolkit I Actually Reach For

VII\. The Craft of the Prompt

VII½. The Tool Ecosystem --- MCP and the Wiring Between Model and World

VIII\. Evaluation and Deployment --- Where Most Projects Actually Die

VIII½. Open Weights, Closed Weights, and Running a Model on My Own
Machine

Epilogue --- The Ocean I Fell Into

About the Author

**PROLOGUE**

**The Night I Stopped Sleeping Right**

**I** am the kind of person who cannot just use something. I have to
open it --- take the back off, look at the wiring, ask why the current
flows the way it flows. Give me a phone and I don\'t care about the
camera, I care about the chip. Give me a market and I don\'t care about
the price, I care about the crowd of minds that produced it. This isn\'t
a hobby. It\'s closer to a compulsion.

So when something finally pulled at me harder than anything else ever
had, I noticed. It didn\'t feel like curiosity anymore. It felt like
gravity --- like standing at the base of a mountain that every other
mountain seemed to lean toward. AI. Not the headlines, not the hype
reels, not the LinkedIn posts calling every prompt a \"breakthrough.\" I
mean what happened when I sat alone at 2 a.m. with a blinking cursor and
a stubborn need to understand the machinery underneath the magic trick.

> ***This book is part history, part confession, part field notes from
> someone still, right now, in the middle of building his way through
> it.***

There are two sides to this story, and I\'ve written them as two roads
rather than a pile of chapters, because that\'s really what they are.
Part One is the ladder --- how prediction became a machine, rung by
rung, for seventy years, and I climb every rung slowly enough this time
to actually show you the mechanism inside each one: the formula, the
failure mode it fixed, and the intuition that finally made it click for
me. Part Two is the road --- how I, and people like me without a
research lab or a warehouse of GPUs, actually use that machine to build
real things, employee by employee, tool by tool. Both roads run on the
same single word. I promise you\'ll see it by the end, and I promise
that by the end you\'ll have enough of both --- the theory under the
hood and the wiring diagram for actually building something --- to stop
being a tourist in either world.

**PART ONE**

**The Ladder**

*How Prediction Learned to Walk --- and How I Learned to Build With It*

**I**

**The Lie of Simplicity**

**The** first thing I learned about AI is that the word itself is a lie
--- not a malicious one, just a lazy one. \"AI\" sounds like a single
subject, something you study for a weekend and check off a list. It
isn\'t. It\'s an ocean, and the moment you put a toe in, you find
provinces: machine learning a continent, deep learning a mountain range
inside it, reinforcement learning and computer vision and NLP each a
lifetime of its own. Pull one thread --- gradient descent, say --- and
it unravels into calculus, linear algebra, probability, the physics of
how information moves through numbers.

I kept asking the same annoying question that has haunted me in every
domain I\'ve entered: why is this thing eating every other field alive?
Medicine, trading, art, law, a documentary editor\'s bay, a farmer\'s
irrigation schedule. What mechanism lets one technology metastasize
across all of human effort at once?

When I actually mapped the field instead of just admiring it from
outside, I found it breaks into a handful of honest provinces, and
knowing the map stopped me from confusing one province\'s tools for
another\'s:

-   Supervised learning --- I already have labeled examples (input,
    correct output) and I\'m teaching a function to reproduce that
    mapping on new inputs it hasn\'t seen. Almost everything in Part
    One\'s ladder lives here.

-   Unsupervised learning --- I have data but no labels, and I\'m asking
    the system to find structure on its own: clusters, compressed
    representations, anomalies that don\'t fit the pattern.

-   Self-supervised learning --- the trick that quietly built the entire
    large-language-model era. I manufacture the label from the data
    itself --- hide the next word and ask the model to predict it --- so
    I get supervised-learning\'s power without paying a human to label
    anything.

-   Reinforcement learning --- no fixed correct answer at all, just a
    reward signal from acting in an environment, and the system has to
    discover, through trial and consequence, which sequence of actions
    accumulates the most reward over time.

I went down the rabbit hole for real --- long nights, the kind where the
sky outside changes color without your permission. And at the bottom I
found something that didn\'t feel like a fact. It felt like a key. The
thing that rules all of it isn\'t a machine, an algorithm, or some
emergent magic hiding in silicon. It\'s one word.

> ***PREDICT.***

Once I had that key, the whole intimidating taxonomy stopped being a
wall of unrelated acronyms and turned into variations on a single
question: given what I\'ve already seen, what comes next, and how
confident am I? A spam filter predicts a label. A translation model
predicts a sequence of tokens in another language. A recommendation
engine predicts which item you\'d click. A self-driving car\'s
perception stack predicts where every other object in the scene will be
a half-second from now. Different inputs, different outputs, identical
skeleton.

**II**

**The Word Underneath Everything**

**One** word is running the most talked-about technology in human
history. Not intelligence. Not consciousness. Not even learning, really
--- learning is just the process by which a system gets better at this
one core act. Every large language model, every fraud detector, every
recommendation feed, every self-driving car\'s perception stack is,
underneath the branding, a machine guessing what comes next given what
came before.

A language model doesn\'t know language --- it predicts the next token,
at a speed no human could sustain, until the predictions start looking
like thought. A trading algorithm doesn\'t understand the market --- it
predicts the next tick from the shape of the ticks before it. A vision
model doesn\'t see a cat --- it predicts the label most consistent with
the pixels. Peel back any AI system enough times and you land on the
same floor: a probability distribution over what happens next, sharpened
by data.

But it stopped being a fact about computers the moment I zoomed out.
Because it isn\'t just AI --- it\'s everything. This entire biological
world runs on the same loop: sense the environment, predict what\'s
about to happen, act to survive the prediction, then compare the outcome
against the prediction to update the next guess. A gazelle that predicts
the lion\'s angle of approach half a second sooner, lives. A trader who
predicts the crowd\'s next move a moment before the crowd does, profits.
Your amygdala fires before you consciously register fear because it
already predicted the threat. Your dopamine system doesn\'t reward the
treat --- it rewards the accuracy of the prediction that led to it,
which is why a surprise reward spikes harder than an expected one.
Neuroscience even has a name: reward prediction error.

![](media/7424699fc7247cc732c4403670207a3e94a461f1.png){width="5.604166666666667in"
height="4.0in"}

*Sense, predict, act, compare --- nature ran this loop for a billion
years before anyone called it machine learning.*

Karl Friston\'s free energy principle pushes this further than I was
ready for the first time I read it: that everything a living brain does
--- perceiving, moving, even attention --- can be described as
minimizing the gap between what it predicted and what it actually
sensed. Not maximizing pleasure. Minimizing surprise. I don\'t bring
this up to claim AI and brains are the same thing --- the substrates are
worlds apart --- but it means the word I found at the bottom of the AI
rabbit hole isn\'t a coincidence of engineering. It might be closer to
the operating principle of any system, biological or artificial, that
has to survive inside an environment it can\'t fully control.

**Why prediction beats memorization**

The deeper I dug, the clearer it became that pure memorization is a dead
end for any system that has to face a world it hasn\'t fully seen yet. A
lookup table only ever answers questions it was already asked.
Prediction, by contrast, is a compression trick --- a model that has
genuinely learned the structure behind data can answer questions it was
never explicitly given, because it has captured the rule generating the
examples, not just the examples. This is exactly why a language model
trained only to predict the next token starts to look like it can
reason, summarize, translate, and code: those are all downstream
consequences of having compressed an enormous chunk of human-written
structure into a predictive rule.

So in that oldest game there is, who survives? Not the strongest ---
strength is expensive and slow. Not even the smartest, if smart just
means holding more facts. The one who predicts fastest, and adjusts
quickest when the prediction is wrong. That\'s the whole game, stripped
to its skeleton. And AI is that same principle wearing a different coat
--- linear algebra and silicon instead of blood and instinct.

**III**

**The Ladder --- How Prediction Learned to Walk**

**The** ambition started humble: predicting something small and linear,
like a house price from its square footage. But the problems kept
getting harder, and stubbornly, step by step, we kept solving them. That
slow climb became a ladder. Most people who talk about AI never actually
climbed it --- they teleported to the top and started narrating. So here
it is, rung by rung, and this time I\'m not skimming past the mechanism
--- I\'m showing you the actual gear-work, the way I had to sit with
each one until it stopped being a black box.

But before I climb the ladder most people know, I have to show you the
foundation underneath it --- the part almost nobody tells you about,
because it happened before "machine learning" was even a phrase anyone
used casually. I didn\'t understand the ladder for real until I went
down into that foundation and found the same word already waiting for
me, decades before the first neural network.

**Rung −3 --- Markov and the Idea That the Future Only Needs the Recent
Past (1906--1913)**

Andrei Markov, a Russian mathematician, wasn\'t thinking about machines
at all. He was arguing with a colleague about independence in
probability, and to make his point he did something almost absurdly
simple: he counted, by hand, how often each letter in Pushkin\'s poem
*Eugene Onegin* was followed by a vowel versus a consonant, across
twenty thousand letters. What he proved is the single idea every
language model on Earth still leans on today --- a *Markov chain*: the
probability of what comes next depends only on the current state, not
on the entire history that led there.

*P(next state \| all previous states) = P(next state \| current state)*

That one-line assumption is a lie, technically --- of course the tenth
word of a sentence depends on more than just the ninth word --- but it\'s
a *useful* lie, because it turns an intractable problem (track
everything that ever happened) into a tractable one (track only what
just happened). Every rung above this one, all the way to a modern
transformer, is really just a more and more sophisticated way of
cheating on that assumption --- widening how much "current state"
actually means, from one letter, to a handful of words, to, eventually,
an entire attention window across a document. The first time I actually
sat with Markov\'s original letter-counting exercise, something clicked
that no amount of reading about transformers had given me: prediction
didn\'t start with silicon. It started with a man and a pencil,
counting letters in a poem, a hundred years before GPT.

**Rung −2 --- Shannon, Entropy, and the Birth of the N-Gram (1948)**

Claude Shannon\'s 1948 paper, *A Mathematical Theory of Communication*,
is the document I\'d point to if someone forced me to name the single
most important paper in the entire history of this field --- more than
any deep learning paper, because it\'s the one that first turned
"information" itself into a number you could compute with. Shannon
defined entropy, a precise measure of how much uncertainty --- how much
genuine surprise --- sits inside a message:

*H(X) = −Σ p(x) log₂ p(x)*

A fair coin flip carries exactly one bit of entropy: maximum
uncertainty, maximum surprise. A rigged coin that always lands heads
carries zero bits: no surprise at all, because you already knew the
answer. Language, Shannon showed, sits somewhere in between --- not
random, but not fully predictable either, and the gap between "fully
random" and "fully predictable" is exactly the room a predictive model
gets to live in.

To make the idea concrete, Shannon ran an experiment that is, in
hindsight, the direct ancestor of every language model I now use daily.
He built what we\'d now call a *bigram model* --- a table of how often
each letter follows each other letter, estimated from real English text
--- and used it to generate new text, one character at a time, sampling
from that table. Then he tried it again with a *trigram* model, three
letters of context instead of two, and the generated text got visibly
more English-like, because more context means a sharper, less uniform
probability distribution over what comes next. He did the same trick
one level up, with whole words instead of letters, and word-level bigram
and trigram models produced garbled but recognizably English-flavored
sentences, decades before anyone had a computer capable of training one
at real scale.

An n-gram model, stripped to its core, is nothing more than a giant
counting table: for every sequence of n−1 words seen in a huge pile of
text, how often was each possible next word the one that actually
followed?

*P(wₙ \| w₁, w₂, \..., wₙ₋₁) ≈ count(w₁\...wₙ) / count(w₁\...wₙ₋₁)*

That's it. No gradient descent, no neurons, no attention --- just
division. And that formula, as primitive as it looks sitting next to a
transformer's attention equation, is doing *the exact same job*:
producing a probability distribution over the next token given some
amount of prior context. The whole seventy-year story I climb through
this chapter is, underneath the escalating cleverness, a story about
two things getting better together --- how much context the model can
actually use, and how efficiently it can represent that context without
its counting table exploding in size. A trigram model over a
50,000-word vocabulary already needs, in principle, 50,000³ possible
entries --- most of which are never seen in any real corpus, a problem
statisticians call *sparsity*, and the entire reason smoothing
techniques (Laplace smoothing, Katz backoff, Kneser-Ney smoothing in
the 1990s) had to be invented: ways of assigning a small, non-zero
probability to word sequences the model had literally never seen in
training, because "probability zero" for an unseen phrase is a
catastrophic overreaction to a training set that will never be
complete. I didn't fully respect how elegant Kneser-Ney smoothing was
until I implemented a toy trigram model myself and watched it fall
apart on any sentence slightly outside its training text --- and then
watched smoothing patch exactly that hole.

I want to be honest about what this rung taught me, because it reframed
everything above it: an n-gram model and a transformer are not
different *ideas*. They are different *engineering answers to the same
question* --- how do I compress a huge pile of text into a function that
predicts what comes next --- separated by seventy years of better
answers to "how do I represent context without the table exploding."
Embeddings replace the counting table with a dense vector space.
Attention replaces "the last n−1 words" with a dynamically weighted look
back across the entire sequence. Neither idea would have been legible
to me without first sitting with Shannon's bigrams and feeling, in my
own hands, why counting alone eventually runs out of room.

**Rung −1 --- Turing's Question, the Perceptron, and the First Winter
(1950--1974)**

In 1950, Alan Turing published *Computing Machinery and Intelligence*
and, rather than trying to define "thinking" --- a word he correctly
suspected was a trap --- he replaced it with a test: could a machine's
written answers be indistinguishable from a human's, to a skeptical
judge, in conversation? He called it the Imitation Game. Whatever you
think of the test's limits, the reframing itself was the real
contribution: stop arguing about the nature of intelligence, and start
asking whether a system's *outputs* are functionally good enough to
fool a discerning observer. That's a prediction question, dressed as a
philosophy question, and I don't think that's a coincidence.

Six years later, in the summer of 1956, a small group of researchers ---
John McCarthy, Marvin Minsky, Claude Shannon among them --- gathered at
Dartmouth College for a workshop whose funding proposal coined the term
"artificial intelligence" outright, and whose stated ambition, read
today, is almost touching in its confidence: that "every aspect of
learning or any other feature of intelligence can in principle be so
precisely described that a machine can be made to simulate it," and
that a serious group of researchers working together for a summer could
make significant progress on it. They were wrong about the timeline by
decades. They were not wrong about the premise.

In 1958, Frank Rosenblatt built the Perceptron --- a single artificial
neuron, a weighted sum followed by a step function, trained on an
actual room-sized machine (the Mark I Perceptron) to classify simple
images. It's Rung 1 of the ladder I climb later in this chapter, just
built two decades earlier than the label "linear model" suggests, and
Rosenblatt's own claims for it to the press were, in hindsight,
wildly overinflated --- he suggested it might one day walk, talk, and
reproduce itself. Then in 1969, Minsky and Papert published a book,
simply titled *Perceptrons*, that proved a single-layer perceptron
mathematically *cannot* learn certain simple patterns --- most famously,
XOR, a function so basic it fits in a two-by-two table, but one that no
straight line can separate. The proof was narrow --- it said nothing
about *stacked* layers of perceptrons, which can solve XOR easily, and
which is exactly Rung 3's neural network --- but the field read it as a
verdict on neural networks broadly, funding dried up, and what's now
called the *first AI winter* set in through the 1970s.

I find this rung the most humbling one in the entire ladder, because
the "failure" wasn't really a failure of the idea. It was a failure of
*depth* --- the fix, stacking layers with a nonlinearity between them,
was sitting right there the whole time, mathematically. What was
missing wasn't insight. It was an efficient way to train more than one
layer at once, which is exactly what backpropagation, popularized a
decade and a half later, turned out to be. Progress on this ladder, I
learned rung by rung, doesn't always fail because an idea was wrong. It
sometimes fails because the *tooling* to realize the idea hadn't been
invented yet, and it's brutally hard, standing inside a winter, to tell
those two failures apart.

**Rung −0.5 --- Symbolic AI, Expert Systems, and the Second Winter
(1970s--1990s)**

While the connectionist thread (perceptrons, and later neural networks)
went quiet, a different bet dominated AI for two decades: *symbolic
AI*, sometimes called "Good Old-Fashioned AI." The premise was that
intelligence is fundamentally about manipulating symbols according to
explicit logical rules --- if this, then that --- hand-written by human
experts. Expert systems like MYCIN (medical diagnosis, 1970s) and
XCON (configuring computer orders for Digital Equipment Corporation,
generating real commercial value by the early 1980s) were built this
way: thousands of hand-coded if-then rules, painstakingly extracted
from human specialists.

It worked, for a while, in narrow domains with clean rules. It didn't
scale, because the real world doesn't hold still long enough for a
human to hand-write every rule it needs, and every new edge case meant
another engineer, another rule, another chance for two rules to quietly
contradict each other deep in a system nobody could fully audit
anymore. By the late 1980s, the cost of maintaining these systems
outpaced their value, funding collapsed again, and the *second AI
winter* set in through the early 1990s. I think about this rung every
single time I catch myself hand-coding a long chain of rigid rules
into one of my own agents instead of trusting a well-prompted model with
a good tool --- that instinct, "just write more rules," is the exact
instinct that built expert systems, and it's the exact instinct the
Bitter Lesson, a few chapters ahead of this one, eventually taught me
to distrust.

**Rung −0.25 --- The Statistical Turn and the Quiet Revival
(1980s--1990s)**

Two things happened almost in parallel that pulled the field out of its
second winter, and both of them are, again, prediction wearing a
different coat. First, IBM researchers in the late 1980s and early
1990s (the "IBM alignment models" for statistical machine translation)
proved that raw n-gram statistics, applied at real scale with real
computing power, could translate French to English competitively
against hand-built rule systems that linguists had spent years
constructing --- data and counting starting to visibly outperform
hand-engineered expertise, decades before the Bitter Lesson gave that
pattern a name. Second, in 1986, Rumelhart, Hinton, and Williams
published the paper that popularized backpropagation for training
multi-layer neural networks --- the exact fix the first winter had been
missing --- and a smaller connectionist revival followed, alongside
John Hopfield's associative memory networks (1982) and the broader
"parallel distributed processing" movement.

Neither revival was the one that changed the world. Compute in the
1980s and 90s still wasn't remotely close to what deep learning would
eventually need, and n-gram language models, while genuinely useful in
speech recognition and early machine translation, hit a hard ceiling: no
amount of more data lets a 3-word or 5-word context window understand
that "it" on page three refers to a name on page one. That specific
limitation --- fixed, short context --- is the exact problem every
subsequent rung above Rung 1 exists to solve, and it's the reason I
can't actually separate the two halves of this book cleanly. The entire
history of "using AI better" and the entire history of "building AI
better" are the same seventy-year argument about how much of the past a
prediction is allowed to see before it has to guess.

> ***Long before gradient descent, before attention, before the word
> "transformer" meant anything but a piece of electrical equipment,
> someone was already counting how often one thing followed another and
> calling the result a probability. Everything since has been a better
> answer to the exact same question Markov asked with a pencil and a
> poem.***

![](media/c6359cca281fefc75faeedfa96d65be19e590dbb.png){width="4.604166666666667in"
height="7.302083333333333in"}

*The ladder I climbed --- every rung still just guessing what comes
next, better than the one before it.*

**Rung 1 --- Linear Models (1950s)**

A weighted sum: multiply each input by an importance factor, add a
baseline, get a prediction. The ancestor of every neural network since
--- GPT, Claude, Gemini all still have millions of these exact weighted
sums stacked inside them. We just learned to bend the line.

*ŷ = w₁x₁ + w₂x₂ + \... + wₙxₙ + b*

The part nobody explained to me plainly at first: how does the machine
actually find the right weights, w? It doesn\'t guess randomly forever.
It starts with a loss function --- a single number describing how wrong
the current weights are, usually mean squared error, the average of
(prediction − actual)² across every training example. Then it uses
gradient descent: compute the slope of that loss with respect to each
weight, and nudge every weight a small step in the direction that makes
the loss smaller. Repeat thousands of times and the weights walk
downhill into a configuration that fits the data. The learning rate
controls the size of each step --- too large and the walk overshoots and
diverges, too small and it takes forever to arrive. That single
walk-downhill idea, gradient descent, is the engine underneath every
rung above this one, all the way to the largest transformer. I didn\'t
fully respect how universal it was until I\'d implemented it by hand for
a one-variable regression and watched the loss curve fall in real time
--- that was the moment linear regression stopped being \'a line of best
fit\' and became \'the simplest possible instance of the exact same
optimization loop that trains GPT.\'

**Rung 2 --- Logistic Regression (1970s)**

The line, passed through a sigmoid, now outputs a probability instead of
a raw number. The first time a machine explicitly models uncertainty ---
\"I\'m 73% sure this is spam\" instead of pretending certainty.

*p = 1 / (1 + e\^-(w·x + b))*

The sigmoid squashes any real number into the range (0, 1), which is
what lets the output be read as a probability. The loss function changes
too --- not squared error, but log loss (cross-entropy), which punishes
a confident wrong answer far more harshly than a hesitant wrong answer.
That asymmetry matters enormously in practice: a model that says \'51%
fraud\' and is wrong costs you a little; a model that says \'99% fraud\'
and is wrong costs you a lot, and log loss is built to reflect that.
This is also the first rung where I had to learn to read a decision
boundary --- the line, now curved slightly by the sigmoid, that
separates the two predicted classes --- and to understand that logistic
regression is still fundamentally linear underneath: it draws one
straight boundary through the feature space, just wrapped in a
probability.

**Rung 3 --- Neural Networks / MLP (1980s)**

Stack linear models with a nonlinear activation between each layer,
trained by backpropagation, and the whole thing bends into shapes a
single line never could --- edges become shapes become objects become
meaning, the same trick your visual cortex pulls.

*layer output = activation(W·x + b), stacked layer after layer*

Two ideas had to click for this rung to stop feeling like magic. First:
the universal approximation theorem, which says a neural network with
even one hidden layer, given enough neurons, can approximate essentially
any continuous function --- the network\'s power comes from the
nonlinear activation between layers (ReLU, sigmoid, tanh) breaking the
whole stack out of being \'just one big linear model in disguise.\'
Without that nonlinearity, ten stacked linear layers collapse
mathematically into one linear layer --- depth would be pointless.
Second: backpropagation, the algorithm that makes training a
many-layered network tractable. It applies the chain rule from calculus,
working backward from the loss at the output layer, computing how much
each weight in every earlier layer contributed to that error, and
updating all of them in a single efficient pass. Before backpropagation
was popularized in the 1980s (Rumelhart, Hinton, Williams), nobody had
an efficient way to assign blame across many layers --- this is the
single mechanical breakthrough that made \'deep\' learning possible at
all, decades before the compute existed to make it spectacular.

**Rung 4 --- Decision Trees, CART (1984)**

A series of yes/no questions instead of a curve --- the most
human-readable model on the ladder, but prone to memorizing noise as if
it were signal: overfitting.

A tree grows by repeatedly asking: which single yes/no question about
the data, at this node, splits the remaining examples into the purest
possible groups? Purity is measured with Gini impurity or entropy ---
both are ways of scoring how mixed the classes are within a group, and
the tree greedily picks the split that reduces that mixture the most.
Keep splitting and eventually every leaf contains a tiny handful of
training examples, fit so perfectly that the tree has memorized the
noise in the training set along with the real pattern --- this is
overfitting, the central disease of every model on this ladder, and the
entire next four rungs exist largely as engineering responses to this
one failure mode. Depth limits, minimum-samples-per-leaf, and pruning
are all just different ways of telling the tree \'stop before you start
memorizing.\'

**Rungs 5--6 --- Bagging (1996) and Random Forest (2001)**

Grow a hundred trees on random slices of data and features, let them
vote. Democracy applied to models --- no single overconfident tree
dominates, and the workhorse of applied ML for two decades is born.

![](media/c0a72ff004e6b4e049290b896d81b1b8ad63e514.png){width="5.604166666666667in"
height="2.3958333333333335in"}

*Bagging trains trees in parallel and votes; boosting trains trees in
sequence, each one correcting the last.*

Bagging (bootstrap aggregating) works because of a clean statistical
fact: averaging many high-variance, low-bias models cancels out their
individual noise while preserving their shared signal, as long as the
errors aren\'t perfectly correlated. Bootstrap sampling --- drawing
random samples with replacement from the training set for each tree ---
is what decorrelates the trees in the first place; without it, every
tree would just be a copy of the same overfit model. Random Forest
pushes the decorrelation further by also restricting each split to
consider only a random subset of features, so trees can\'t all lean on
the one dominant variable and end up correlated anyway. The result, when
I actually benchmarked it myself against a single deep tree on noisy
data, was startling: individually mediocre trees, averaged, consistently
beat one very deep, very overfit tree --- my first real, hands-on proof
that an ensemble of weak, diverse guesses can out-predict one strong,
brittle guess.

**Rung 7 --- Boosting (1995--2000)**

Build one weak tree, see exactly where it fails, build the next tree to
fix those failures. A chain of humility --- each learner admits what it
doesn\'t know and hands the problem to the next.

*F_m(x) = F\_{m-1}(x) + η · h_m(x) where h_m fits the residual error of
F\_{m-1}*

Where bagging runs trees in parallel and averages, boosting runs them in
sequence and corrects. Each new tree, h_m, isn\'t trained to predict the
target directly --- it\'s trained to predict the residual, the gap
between the current ensemble\'s prediction and the true answer. The
learning rate η shrinks each correction so the ensemble improves
gradually rather than overreacting to any single tree\'s fix, which is
what keeps boosting from overfitting as fast as its raw power would
otherwise suggest. AdaBoost, the earliest popular version, did this by
reweighting misclassified examples so the next learner paid more
attention to them; gradient boosting generalized the idea into fitting
residuals directly via gradient descent on an arbitrary loss function,
which is the version that scaled into everything after it.

**Rung 8 --- XGBoost / LightGBM (2014--2016)**

Gradient boosting re-engineered for real-world speed. Quietly some of
the most deployed models on Earth --- a bank scoring your loan or an
insurer pricing your premium is more likely running one of these than a
flashy neural net.

What XGBoost actually added on top of plain gradient boosting is worth
knowing precisely, because it\'s the difference between a research idea
and a production workhorse: explicit L1/L2 regularization terms added
directly into the loss function to penalize overly complex trees, a
second-order (Newton\'s method) approximation of the loss for faster,
more accurate convergence, and highly optimized handling of missing
values and sparse data. LightGBM pushed speed further with
histogram-based binning of continuous features (trading a little
precision for a lot of speed) and leaf-wise tree growth instead of
level-wise, which grows the single leaf that reduces loss the most at
each step rather than growing every leaf at a given depth evenly. In
every tabular-data project I\'ve built --- the trading systems, the risk
scoring --- this rung, not deep learning, was almost always my first and
most reliable tool. Deep learning wins on unstructured data: images,
audio, raw text. Gradient boosting still quietly wins on the
rows-and-columns data that runs most of the world\'s actual business
decisions.

**Rung 9 --- Deep Learning: CNNs and Transformers (2012+)**

AlexNet (2012), trained on GPUs, crushed ImageNet and pivoted the field
overnight. Then in 2017, \"Attention Is All You Need\" introduced the
Transformer --- every part of the input looking at every other part
simultaneously, deciding mathematically how much to attend to each. That
mechanism is what lets a model understand a pronoun on page three
referring to a name on page one. Scale it up and you get GPT, Claude,
every model reshaping the world as I write this.

Before transformers, sequence models like RNNs and LSTMs processed text
one token at a time, in strict order, carrying a compressed memory
forward --- which meant they were slow to train (no parallelism across
the sequence) and prone to forgetting information from far earlier in a
long sequence, since it had to survive being repeatedly compressed
through every intermediate step. The transformer\'s self-attention
mechanism solves both problems at once by letting every token look
directly at every other token in a single step, regardless of distance,
and by processing the whole sequence in parallel rather than one step at
a time. Concretely, every token is projected into three vectors --- a
Query, a Key, and a Value --- and attention is computed as:

*Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V*

Intuitively: the Query is what a token is \'looking for,\' the Key is
what every other token \'advertises\' about itself, their dot product
measures how well they match, softmax turns those match-scores into a
clean probability distribution that sums to one, and the Value is the
actual information pulled in, weighted by that distribution. Multi-head
attention runs several of these Q-K-V projections in parallel with
different learned weights, so different heads can specialize --- one
head tracking grammatical agreement, another tracking long-range topical
relevance --- and their outputs are concatenated back together. Because
attention has no inherent sense of order (it treats the sequence as an
unordered set unless told otherwise), positional encodings are added to
each token\'s embedding to inject information about where it sits in the
sequence. Stack a few dozen of these attention-plus-feedforward blocks,
scale to billions of parameters, and train on a large enough slice of
the internet, and this rung produces everything from GPT to Claude ---
but the atomic mechanism, underneath all of it, is still that one
softmax-weighted lookup, repeated and stacked.

![](media/25558e0358d76ddd5c7ea7e1177421bc7b2b769f.png){width="5.395833333333333in"
height="2.3958333333333335in"}

*\"It\" resolves to \"trophy\" because attention learned that binding
pattern from data, not a grammar rule.*

> ***Every rung does the exact same thing underneath. Predict. The tools
> got more elaborate. The core word never changed.***

**III½**

**What Actually Happens Inside the Sentence**

**When** you type a sentence to Claude or GPT, the model doesn\'t read
it the way you do. First comes tokenization --- your sentence chopped
into pieces, each mapped to a number. Understanding isn\'t in the room
yet; it\'s still bookkeeping.

Most modern models use a subword scheme called byte-pair encoding (BPE)
or a close relative --- common words like \"the\" become a single token,
but rarer words get split into fragments (\"unbelievable\" might become
\"un\", \"believ\", \"able\"). This is a deliberate compromise:
whole-word tokenization would need an impossibly huge vocabulary to
cover every word in every language, while character-level tokenization
would make sequences absurdly long and hard for attention to relate
distant parts of. Subword tokenization lets the model handle any word,
including ones it\'s never seen, by falling back to fragments, while
keeping common words efficient as single units.

Then each number becomes an embedding --- a long vector representing
that token\'s meaning as a position in a mathematical space. Words that
mean similar things end up near each other, geometrically. \"King\"
minus \"man\" plus \"woman\" lands you near \"queen\" --- not by rule,
but because the geometry of meaning fell out of predicting text at
scale.

Then comes attention: every token looks at every other token and
decides, mathematically, how much to care about it. In \"the trophy
didn\'t fit in the suitcase because it was too big,\" the word \"it\"
has to reach back and decide whether it means the trophy or the
suitcase. Stack enough attention layers across enough tokens and the
model builds something that functions, for all practical purposes, like
context.

![](media/7b2bf3b8d8f38467db38ec2ccadc69456e712169.png){width="5.802083333333333in"
height="2.3020833333333335in"}

*Text to prediction --- the whole trick laid end to end.*

And then, at the end of all that machinery, the model does the one thing
this whole book is about. It predicts --- a probability distribution
over every possible next token, usually sampled rather than the single
most likely one, so the output doesn\'t feel robotic. Then it does the
whole thing again, one token later. That\'s the entire \"magic\": a
staggeringly sophisticated autocomplete, run at a scale that starts to
look like reasoning the longer the chain gets.

**How the next token actually gets chosen**

The raw output of the final layer is a set of numbers called logits, one
per possible token in the vocabulary, and softmax converts them into a
probability distribution. But the model rarely just picks the single
highest-probability token every time (that\'s called greedy decoding,
and it tends to produce flat, repetitive text). Instead, sampling
strategies shape the choice: temperature scales the logits before
softmax --- a low temperature sharpens the distribution toward the most
likely tokens (more deterministic, more repetitive), a high temperature
flattens it toward more randomness (more creative, more error-prone).
Top-k sampling restricts the choice to only the k most likely next
tokens before sampling among them. Top-p (nucleus) sampling instead
keeps the smallest set of tokens whose cumulative probability crosses a
threshold p, which adapts naturally to how confident the model is at
each step --- a very confident distribution might only need one or two
tokens in the nucleus, an uncertain one might need dozens. Every time
I\'ve tuned an application built on top of an LLM API, temperature and
top-p were the two levers that mattered most for getting outputs that
felt right for the task --- near-zero temperature for a tool that must
output valid, parseable JSON, higher temperature for brainstorming or
creative copy.

Once I saw this pipeline clearly, hallucination stopped being
mysterious. A model isn\'t a database that looks up facts and sometimes
fails --- it\'s a prediction engine that never stops predicting, even
when it doesn\'t know something. Fluency was never coupled to truth. It
was only ever coupled to probability. That\'s why assumption
transparency --- which I\'ll come back to in Part Two --- isn\'t a
nice-to-have. It\'s a patch over a structural fact about how these
systems are built.

**PART TWO**

**The Road**

*How I Learned to Use AI --- and Do the Magic*

**IV**

**The Other Side of the Coin**

**Everything** in Part One --- that entire ladder --- is only one side
of the coin. The side of inventing: the researcher in the lab, the
handful of labs on Earth with enough compute to train a frontier model
from scratch. For a long time I thought that was the only side that
mattered. If I wasn\'t building the model itself, I wasn\'t really
\"doing AI.\" I was just a tourist.

I was wrong, and figuring out why changed the direction of everything I
build now. There is another side of the coin: using it. And this, to me,
is the far more interesting half --- not because it\'s easier, but
because it\'s where the actual leverage lives right now for someone
without a research lab or a warehouse of GPUs.

It isn\'t about who builds the fanciest new model anymore. Dozens of
extraordinarily powerful models already sit out there, priced by the
token, reachable from a laptop. The genuinely rare skill isn\'t
inventing the engine --- it\'s knowing how to drive it into a system
that does something real, reliable, and valuable in the world.

> ***Evolution never rewards the one who invents from nothing. It
> rewards the one who repurposes what already exists --- a fin becomes a
> limb, a scale becomes a feather. AI is having its own version of that
> moment right now.***

So that\'s where I found myself: not out-inventing a research lab, but
taking models that already exist --- genuinely world-class --- and using
them to build real things across worlds I had no business touching.
Healthcare. Business analysis. Trading systems. AI didn\'t teach me
those domains; it handed me the keys and trusted me to learn fast enough
not to embarrass myself once inside.

**The three ways to actually use a model**

Once I committed to this side of the coin, I had to learn the real menu
of options for pointing a pretrained model at a specific problem ---
because \"just use AI\" isn\'t a plan, it\'s three genuinely different
engineering decisions with different costs:

-   Prompting --- shaping the model\'s behavior purely through the
    instructions and examples in the input, no weights touched at all.
    Cheapest, fastest to iterate, and, with a well-designed system
    prompt and a few examples (few-shot prompting), surprisingly
    far-reaching. This is where I start every single project now.

-   Retrieval-Augmented Generation (RAG) --- the model\'s own knowledge
    is frozen at its training cutoff and it has no memory of my specific
    data, so I hand it the relevant facts at query time instead: embed
    my documents, retrieve the closest ones to the current question, and
    stuff them into the prompt as grounding context. This is how I give
    a general-purpose model specific, current, private knowledge without
    retraining anything.

-   Fine-tuning --- actually adjusting the model\'s weights on a custom
    dataset so a behavior or style becomes baked in rather than
    instructed each time. The most expensive and slowest option, and in
    my experience the one most people reach for too early, before
    they\'ve exhausted what prompting and RAG can already do for a
    fraction of the cost.

The order I just listed them in is also, deliberately, the order of the
ladder I climb on every new project: start with the cheapest lever, and
only reach for the next one when the cheaper one has genuinely run out
of room.

**IV½**

**Three Things Nobody Told Me Early Enough**

**Before** the second ladder --- the one about using AI instead of
building it --- three pieces of knowledge took me embarrassingly long to
piece together. I wish someone had just told me plainly, so I\'m telling
you plainly.

**The Bitter Lesson (Rich Sutton, 2019)**

Across seventy years of AI research, the approaches that won were almost
never the ones where humans cleverly hand-engineered domain knowledge
into the system. They were the ones that gave a general-purpose method
more data and more compute, and let it find the patterns itself. Human
cleverness about what the answer should look like keeps getting outrun
by raw scale plus a general method.

The practical consequence I had to absorb: when I\'m building an agent,
I now spend far less time hand-coding rigid rules for every edge case,
and far more time giving the model good tools, good context, and the
freedom to reason its own way to the answer. Every time I\'ve fought
this lesson --- building an elaborate rule tree instead of trusting a
well-prompted model with a good tool --- the hand-built version
eventually lost to a simpler, more general approach as the underlying
models improved.

**Scaling Laws (OpenAI, \~2020; DeepMind\'s \"Chinchilla,\" 2022)**

A model\'s performance improves in a remarkably predictable curve as
parameters, data, and compute increase together --- predictable enough
to forecast a model\'s quality before training finishes. Intelligence,
at least this prediction-shaped version of it, isn\'t a mysterious
spark. It\'s a dial you can chart in advance.

*Loss(N, D) ≈ A/N\^α + B/D\^β + E (N = parameters, D = training tokens)*

The Chinchilla finding specifically corrected an earlier mistake: for a
fixed compute budget, most labs had been training models that were too
large relative to the amount of data they were fed. Chinchilla showed
that model size and training data should scale roughly together --- a
smaller model trained on proportionally more data can outperform a
larger model that was undertrained. I don\'t train frontier models
myself, but this shapes how I think about my own smaller fine-tunes and
from-scratch experiments: more data on a right-sized model consistently
beats a bigger model starved of data.

**RLHF --- Reinforcement Learning from Human Feedback**

A model trained purely to predict the next token will happily continue
in the most statistically likely direction, which isn\'t the same as the
most helpful or honest one. RLHF is the extra stage where humans rank
responses, a reward model learns those preferences, and the main model
is tuned --- traditionally via a reinforcement learning algorithm called
PPO (Proximal Policy Optimization) --- to score well against them,
teaching taste, not just fluency. A newer, simpler alternative called
DPO (Direct Preference Optimization) achieves a similar effect without
needing a separate reward model or the full reinforcement-learning loop,
by directly optimizing the model on preference pairs --- and I\'ve
watched this technique show up more and more in smaller open fine-tunes
because it\'s dramatically cheaper to run than full RLHF. Every time a
model declines something harmful or admits uncertainty instead of
bluffing, that behavior was very likely shaped here.

> ***Scale plus a general method produces raw predictive power along a
> knowable curve, and human feedback sculpts that power into something
> that behaves like a collaborator instead of an oracle.***

**V**

**The Evolution of Using AI**

**There\'s** a road I keep climbing, one stage at a time, and most
people alive right now are living through it without fully registering
how strange it is.

![](media/f56a8db00ae1f80c8beccd22816f3d5d28d2caf5.png){width="6.0in"
height="2.3020833333333335in"}

*The road I keep climbing, one stage at a time.*

**Stage 0 --- No Software**

Just us, alone with the problem: a pen, a spreadsheet, and stubbornness.
Slow and exhausting, but it teaches you the shape of a problem like
nothing else.

**Stage 1 --- Traditional Software**

Deterministic rule-followers --- Excel, SAP, backend systems. Powerful
but rigid; no judgment, no adaptation. If the world shifts outside the
rules the programmer anticipated, it breaks with total, unearned
confidence.

**Stage 2 --- AI-Assisted Software (where most of us live now)**

We stopped writing every line ourselves. We describe what we want in
plain language and let AI write the first pass --- Copilot, Cursor,
Claude Code. AI stopped sitting politely on the side of the desk and
became the programmer sitting where the junior developer used to sit.

The skill this stage actually rewards isn\'t typing speed, it\'s
specification --- the clearer and more testable my description of what I
want, the less back-and-forth correction the whole loop needs. I learned
to write requirements the way I\'d brief a very fast, very literal
junior engineer: explicit inputs, explicit outputs, explicit edge cases,
and a way to verify the result is actually correct rather than just
plausible-looking.

**Stage 3 --- Digital Employees (already here, and where I actually live
mid-build)**

Humans stop just using AI and start hiring it. An AI Business Analyst,
an AI Accountant, an AI Researcher --- something that reasons about a
novel situation, remembers what happened last week, and pulls the right
tool at the right moment.

There\'s a huge difference between a \"prompt wrapper\" bolted onto a
chatbot and an actual agent that deserves the name \"employee.\" I\'ve
learned the difference the hard way --- by building something, watching
it fail exactly the way a fake employee would fail, and figuring out
why. A real digital employee needs four things.

![](media/0174f5a5660217fd59cdd8f82c5d1d42a026319d.png){width="6.197916666666667in"
height="3.3020833333333335in"}

*The four pillars I now build every agent on top of.*

An orchestrator decides what kind of thinking the moment calls for,
instead of running the same generic loop on everything. Persistent
memory carries forward a compressed, evolving model of what\'s already
been learned, instead of relearning from zero each session like a
goldfish. Deterministic tool separation hands anything that must be
exactly right --- a tax calculation, a break-even formula, a
schema-specific API call --- to real code, not an LLM \"vibing\" its way
to an approximately correct number; the model\'s job there is to decide
which tool to call, with what inputs, and to sanity-check what comes
back. And assumption transparency means the system says \"I don\'t
know\" out loud instead of quietly filling the gap with a
confident-sounding guess --- arguably the most important of the four,
because false confidence is exactly what turns a useful employee into a
liability.

I\'m building exactly this now --- a system I call AICrew: digital
employees reporting, conceptually, into a CEO agent. A Business Analyst,
a Financial Analyst, a Research Scientist, a Software Engineer, a QA
Engineer, each on that same four-part backbone.

![](media/34c6ca2975fbca011576c82375ecace138f95c5a.png){width="5.604166666666667in"
height="3.8958333333333335in"}

*AICrew, laid out honestly --- the orchestrator and the four pillars sit
above every employee, not beside them.*

**How a digital employee actually decides what to do**

Most working agents run on a loop researchers call ReAct --- Reason plus
Act, from a 2022 paper. The model reasons in plain text about what the
situation calls for (\"I need the company\'s fixed costs before I can
compute a break-even point\"), then acts by calling a real tool with
specific arguments, then observes what that tool actually returned, then
loops back to reasoning with the new information folded in. It keeps
cycling until the goal is actually met, not just talked about.

![](media/04adb5d9845f077136cfb4600594879509da2436.png){width="4.604166666666667in"
height="4.604166666666667in"}

*Reason. Act. Observe. Loop. The whole trick behind almost every agent
I\'ve built.*

Written out the way I actually trace it while debugging one of my own
agents, one cycle looks like this:

THOUGHT: I need fixed costs and contribution margin

before I can compute break-even units.

ACTION: call get_financials(company_id=\"acme\")

OBSERVATION: {fixed_costs: 40000, price: 25, var_cost: 15}

THOUGHT: contribution margin = 25 - 15 = 10.

break-even units = 40000 / 10 = 4000.

ACTION: call breakeven_calculator(fixed=40000,

price=25, variable=15)

OBSERVATION: {breakeven_units: 4000, breakeven_revenue: 100000}

THOUGHT: goal satisfied --- report the result.

Notice the arithmetic itself never happens inside the model\'s head ---
the model reasons about which tool to call and with what numbers, but
the actual division is delegated to breakeven_calculator, a few lines of
deterministic Python. That\'s deterministic tool separation, not as an
abstract principle but as a literal line in the trace.

This loop is what turns a chatbot into an employee. A chatbot answers
once, from memory, and stops. An agent running this loop goes and gets
the real number instead of guessing it, notices the number contradicts
its first assumption, and corrects course --- the same self-correcting
posture that made gradient boosting so powerful two chapters ago, now
running at the level of a whole task instead of a single prediction.

Memory works alongside this loop through two mechanisms, often both at
once. A vector store converts every important fact into an embedding
and, when a new task arrives, retrieves the vectors closest in meaning
--- retrieval-augmented generation, RAG. Compression periodically
summarizes everything that\'s happened into a smaller state, carrying
forward the gist of a hundred interactions without the full weight of
the transcripts. Retrieval finds the specific fact; compression
preserves the shape of everything else.

![](media/7756e5868da2e37c8e5f91debbaa93a5b437a862.png){width="5.802083333333333in"
height="2.8958333333333335in"}

*Retrieval finds the specific fact. Compression preserves the shape of
everything else.*

The distance metric behind that retrieval is almost always cosine
similarity --- measuring the angle between two embedding vectors rather
than their raw distance, which matters because it makes the comparison
insensitive to how long or short the original text was, only to what it
means. In practice I chunk documents into overlapping passages before
embedding them, because a single embedding for an entire long document
blurs together too many different ideas to retrieve precisely --- the
size of that chunk, and how much it overlaps its neighbor, turned out to
matter more to real-world retrieval quality than which embedding model I
picked.

**Stage 4 --- Digital Organizations (emerging)**

Not one AI employee but a team, coordinating like a real company. You
say \"launch a new product\" and the organization moves --- researching,
running numbers, building, testing, documenting, with oversight only at
the boundaries. The challenge here isn\'t intelligence anymore; it\'s
coordination --- how a dozen semi-autonomous agents share state without
corrupting each other\'s work, and how a decision chain across five
specialist agents gets audited after the fact when something goes wrong.

The pattern I keep returning to for this stage is hierarchical
delegation rather than a flat swarm: one orchestrator agent breaks a
large goal into subtasks and routes each to the specialist best suited
for it, rather than every agent talking to every other agent in an
unstructured mesh. A flat mesh scales quadratically in coordination
overhead as agents are added; a hierarchy scales close to linearly, at
the cost of the orchestrator becoming a single point of failure ---
which is exactly why the transparency pillar matters even more at this
stage than at Stage 3: an orchestrator that hides its own uncertainty
can silently misroute an entire chain of specialist work.

**Stage 5 --- Autonomous Companies (mostly future)**

The horizon you can already see the outline of, the way you see a
mountain range before any single tree on it. A company that keeps
running, improving itself, hiring new specialist agents when a gap
becomes obvious, humans stepping back to set the goals and the
boundaries --- the constitution --- and watching it correct its own
course. I don\'t think this arrives all at once on a single headline
day. I think it arrives the way everything on this ladder has arrived:
quietly, rung by rung, mostly unnoticed by anyone not already standing
on it.

**V½**

**Building the Business Analyst --- My Break-Even Calculator, Rung by
Rung**

**I** don\'t trust an architecture until I\'ve built the smallest
possible version of it end to end. So before I let myself design the
full AICrew system on paper, I forced myself to ship one tool, all the
way through, for the very first employee: a break-even calculator inside
the Business Analyst module. Here is exactly how I built it, in the
order I actually did it.

**Step 1 --- Define the deterministic core first**

Before writing a single prompt, I wrote the plain function the whole
tool depends on, with no AI involved at all, because this number has to
be exactly right every time:

def breakeven_units(fixed_costs, price, variable_cost):

contribution_margin = price - variable_cost

if contribution_margin \<= 0:

raise ValueError(

\"price must exceed variable cost\")

return fixed_costs / contribution_margin

This is the deterministic tool separation pillar in its rawest form. The
model will never be asked to do this division itself --- its only job is
deciding when to call this function and with which numbers.

**Step 2 --- Wrap it as a callable tool with a strict schema**

Next I gave the tool a name, a description, and a strict input schema,
because an LLM calling a tool needs the same clarity a junior engineer
would need from an API spec --- vague parameter names produce vague,
wrong calls:

tool: breakeven_calculator

description: \"Computes break-even units and revenue

from fixed costs, unit price, and unit variable cost.\"

parameters:

fixed_costs: number (required)

price: number (required)

variable_cost: number (required)

**Step 3 --- Give the orchestrator a reason to reach for it**

I wrote the Business Analyst\'s system prompt to explicitly instruct it:
whenever a break-even, margin, or viability question comes up, call
breakeven_calculator rather than computing the number in its own head.
This single instruction eliminated almost every arithmetic error I\'d
seen in my earlier, tool-less prototype --- the model\'s raw mental math
on multi-step financial formulas was fluent-sounding and occasionally
just wrong, exactly the hallucination pattern from Part One\'s III½
showing up in a business context.

**Step 4 --- Force assumption transparency**

I added an explicit rule: if any required number (fixed costs, price,
variable cost) isn\'t in the conversation or retrievable from memory,
the agent must ask for it or flag it as an assumption, never silently
invent a plausible-sounding figure. This turned out to be the single
highest-leverage rule in the whole build --- it\'s the difference
between a tool I can actually trust with a real business decision and a
tool that produces confident nonsense on missing data.

**Step 5 --- Wire in memory, then test the whole loop**

Finally I connected the tool call into the ReAct loop so a follow-up
question (\"what if I raise the price by two dollars\") could reuse the
company\'s fixed costs already retrieved earlier in the session instead
of asking again --- a small but real test of the memory pillar. Only
once all four pillars were exercised, together, on this one small tool,
did I let myself start sketching the Financial Analyst and Research
Scientist employees on top of the same backbone.

> ***The smallest concrete forcing function beats the most beautiful
> diagram, every single time.***

**VI**

**Two Roads, One Traveler**

**Here\'s** the full road, start to finish, both sides of the coin laid
end to end: paper, traditional software, AI writing software, AI
employees, AI organizations, autonomous companies. And underneath every
rung of that road, quietly, is the same word that ran the other ladder
--- the one about model architectures. Predict. A business analyst
predicting whether a venture breaks even. A digital employee predicting
which tool a task requires. An autonomous company predicting which move
keeps it alive in a market that never holds still.

![](media/19335f9e2a663dc5b1679ea803aa6ba030b118fd.png){width="5.604166666666667in"
height="3.1041666666666665in"}

*Two roads, seemingly about different things --- architecture and
organization --- braiding into the same root.*

When I zoom all the way out, I don\'t see a chart. I see a mirror.
Somewhere on that path is exactly where I stand right now --- not
watching from the outside, but building inside it, one project at a
time, one break-even calculator at a time before the next, bigger piece.

I think about my own mind the same way, honestly, because I don\'t
believe the two are as separate as they look. An Observer that watches,
an Interpreter that makes meaning of what\'s observed, a Narrator that
turns it into a story --- that architecture isn\'t so different from the
orchestrator-memory-tool-transparency backbone I just described for a
digital employee. Both are trying to solve the same problem: how do you
reason about what\'s happening without confusing the reasoning for the
happening itself.

This is also where my trading background stopped feeling like a separate
interest and started feeling like the same subject wearing a third coat.
Markets are, structurally, a prediction tournament with money as the
scoreboard --- and the Efficient Market Hypothesis (Eugene Fama, 1970s)
says something sobering about that tournament: a liquid market\'s price
already reflects almost everything knowable about it, because every
trader with an edge has acted on it, and in acting on it, erased it. A
model that predicts the next candle with genuine skill is worth more
than almost anything else you could build --- and that edge decays the
moment enough people run the same model against the same market. A
market reacts to being measured. The real skill was never finding a
pattern. It\'s finding a pattern faster than the pattern erases itself.

Every evolutionary trading system I\'ve built taught me a version of the
bias-variance tradeoff from Part One in a much harsher, real-money form:
a strategy overfit to historical price data will backtest beautifully
and then bleed out the moment it meets live, unseen market structure ---
the exact same failure mode as a decision tree grown too deep, just
measured in currency instead of accuracy. Walk-forward validation, where
a strategy is tuned on one window of time and tested, unseen, on the
next window forward, is the trading world\'s version of a held-out test
set, and I trust a strategy\'s backtest exactly as much as I trust it,
and not a percentage point more.

There\'s a tension in me I\'ve stopped expecting to resolve. I
understand architecture fast --- sometimes fast enough that the
understanding becomes a trap, a comfortable room I can sit in
indefinitely without stepping into execution. Insight arrives quickly.
Building it lags behind. Naming that gap out loud, over and over, is how
I keep dragging myself back toward the smallest next concrete step
instead of the next beautiful diagram.

**VI½**

**The Toolkit I Actually Reach For**

**Theory** earns its keep only when it survives contact with a real
stack. So here, plainly, is the actual toolkit underneath everything
described above --- not a sales pitch for any one vendor, just the
honest shape of what I reach for and when.

**Models and access**

For reasoning-heavy agent work I reach for a frontier hosted model
through its API rather than trying to self-host something comparable ---
the economics rarely favor self-hosting until volume is very high, and
the frontier models are simply better at the multi-step reasoning a real
agent needs. For narrow, high-volume, latency-sensitive tasks
(classification, extraction, a fixed-format response), a smaller and
cheaper model, sometimes even a fine-tuned open-weight model I run
myself, is the more honest engineering choice --- using a frontier
reasoning model for a task a five-dollar classifier could handle is a
waste I\'ve made and corrected more than once.

**Orchestration**

For anything beyond a single tool call, I need an explicit loop --- the
ReAct pattern from Part Two, implemented either by hand as a simple
Python loop (call model, parse tool call, execute, feed result back) or
through an agent framework that provides that loop, tool registration,
and memory hooks out of the box. I\'ve learned to write the loop by hand
at least once for any new pattern before reaching for a framework,
because debugging a framework\'s abstraction over a loop I don\'t
understand is far harder than debugging a loop I wrote myself.

**Memory**

A vector database for the RAG half of memory --- the mechanism only
matters in that it needs to store embeddings and answer nearest-neighbor
queries fast; the choice of embedding model matters more than the choice
of database in my experience, because a poor embedding model retrieves
poor neighbors no matter how fast the lookup is. For the compression
half, I periodically ask the model itself to summarize the running
session into a compact state object, which is a strange, recursive thing
to do --- using a predictor to compress the history of its own
predictions --- but it works, and it mirrors, more than I expected going
in, the way a human mind consolidates a day\'s experience into a much
smaller trace during sleep.

**Deterministic tools**

Anything with a right answer --- arithmetic, a database query, an API
call with a fixed schema, a regulatory calculation --- becomes ordinary,
boring, well-tested code, exposed to the model as a callable tool with a
strict schema. I hold this line firmly: the moment I catch myself
letting a model \"estimate\" something that has an exact, computable
answer, I\'ve reintroduced the exact failure mode Part One\'s III½
predicted --- fluency mistaken for correctness.

**Evaluation**

The habit that took longest to build was testing an agent the way I\'d
test any other system --- a fixed set of realistic scenarios with
known-correct outcomes, run automatically every time I change a prompt
or a tool, rather than eyeballing a handful of manual conversations and
declaring victory. An agent that looks impressive on the three examples
I happened to try and an agent that\'s actually reliable are two
different claims, and only the first one is free.

**VII**

**The Craft of the Prompt --- What I Actually Do Before I Write One
Word to a Model**

**Everyone** who has used a chatbot thinks they know what a prompt is.
Almost nobody who's shipped a real product on top of one still believes
that. A prompt isn't a question. It's the entire specification of a
tiny, temporary employee you're about to hire for one task and fire a
few seconds later --- and the quality of that hire is set entirely by
what you tell them before they start.

The single biggest jump in output quality I've ever gotten from a
prompt change didn't come from clever wording. It came from
**chain-of-thought prompting** --- simply asking the model to reason
step by step before giving a final answer, rather than jumping straight
to a conclusion. The 2022 paper that popularized this (Wei et al.,
"Chain-of-Thought Prompting Elicits Reasoning in Large Language
Models") showed something that shouldn't have been surprising in
hindsight, given everything in Part One: a model that predicts one
token at a time genuinely reasons better when it's allowed to "think
out loud" on the page first, because each intermediate token becomes
extra context the model itself gets to condition on for the next
prediction. Forcing an answer immediately denies the model the very
scratch space that makes multi-step reasoning possible at all. This is
also why modern "reasoning models" --- the ones trained explicitly to
produce long private reasoning traces before answering --- are, at
bottom, chain-of-thought turned into a trained behavior instead of a
prompted one.

**Few-shot prompting** --- showing the model two or three examples of
the exact input-output pattern I want, rather than only describing it
--- almost always outperforms a purely descriptive instruction, because
examples remove ambiguity that language can't fully close. If I want a
strict JSON schema back, I don't just say "return JSON" --- I show one
complete, correctly-formatted example, and the model's own in-context
pattern-matching, the same geometry-of-meaning trick from Part One's
III½, does the rest.

**Self-consistency** takes chain-of-thought one step further: instead
of asking for one reasoning path, I sample several independent
reasoning paths at a higher temperature and take the answer that shows
up most often across them --- a direct echo of the bagging idea from
Rung 5, democracy applied not to trees anymore but to a single model's
own reasoning attempts. I reach for this specifically on high-stakes,
single-shot questions where I can afford three or five calls instead of
one, and it has caught more silent arithmetic and logic slips than any
other single technique in my toolkit.

**Context engineering**, which I now consider a more accurate term than
"prompt engineering" for most real work, is the discipline of managing
*everything* in the model's context window, not just the instruction at
the top: retrieved documents, prior turns, tool outputs, system rules,
even the order those pieces appear in. Position matters more than
people expect --- models tend to weight information near the beginning
and end of a long context more heavily than information buried in the
middle, an effect researchers have called "lost in the middle." I've
learned to put my most load-bearing instructions at the very top or the
very bottom of a prompt, never sandwiched deep inside a wall of
retrieved text, and to actively prune stale context rather than letting
a session's history grow forever --- exactly the compression pillar
from Part Two's Stage 3, applied at the level of a single prompt instead
of a whole agent's memory.

**VII½**

**The Tool Ecosystem --- MCP and the Wiring Between Model and World**

**A** model, on its own, is a closed room with no windows --- brilliant
at reasoning over whatever's already in its context, blind to anything
that happened after its training cutoff, and physically incapable of
doing anything in the world beyond emitting text. Every real agent I've
ever built lives or dies on the wiring between that closed room and the
outside world, and for a long time that wiring was bespoke and fragile
--- every application inventing its own private way of describing tools
to a model.

The **Model Context Protocol (MCP)**, introduced by Anthropic in late
2024, is the standardization I wish had existed when I started: an open
protocol that lets any tool, database, or service describe itself to
any compatible model in a consistent way, so a developer building a new
integration writes it once and it works across any client that speaks
the protocol, instead of once per application. Practically, an MCP
server exposes a set of tools with names, descriptions, and strict
input schemas --- precisely the shape I hand-rolled myself for the
break-even calculator in Part Two's V½, just standardized so it isn't
reinvented from scratch on every project. The deeper shift this
represents, the one that actually matters for how I design systems now,
is that "which tools does my agent have access to" is becoming a
question of *which servers I connect*, not *how much custom integration
code I'm willing to write* --- the same leverage jump that happened
when APIs replaced screen-scraping, just one layer higher, for agents
instead of scripts.

I hold the same discipline here that I hold everywhere else in this
book: a tool's description and schema are the entire interface the
model reasons against, so a vague tool description produces the exact
same failure mode as a vague human job description --- confident,
plausible-sounding misuse. The clearer the tool's contract, the less
the orchestrator has to guess.

**VIII**

**Evaluation and Deployment --- Where Most Projects Actually Die**

**Nobody's** demo fails. I've watched dozens of AI prototypes look
extraordinary in a five-minute walkthrough and then quietly rot in
production, and the gap between those two facts taught me more about
this field than any paper did. A demo is three cherry-picked examples
performed live by the person who built the thing. Production is
thousands of examples performed by strangers who don't know the
system's blind spots and have no reason to phrase their request the way
you rehearsed it.

The discipline that closes that gap is building a real **eval suite**
before I trust anything: a fixed, versioned set of realistic inputs
paired with a rubric or a known-correct answer, run automatically every
time a prompt, a tool, or a model version changes. For tasks with a
verifiable right answer --- the break-even calculator, a classification
task, a structured extraction --- the eval can score itself exactly.
For open-ended tasks --- a summary, a piece of written analysis --- I
either use a rubric a human scores against, or a second, carefully
prompted model acting as an "LLM judge," a technique that works
surprisingly well as long as the judge's rubric is as specific and
concrete as the tool schemas from Part Two, and as long as I
periodically spot-check the judge against my own human judgment so it
doesn't quietly drift.

Two failure modes recur constantly once something is live, and I've
learned to actively watch for both. **Prompt drift** is what happens
when a model provider silently updates the underlying model behind an
API endpoint, and behavior that used to be reliable starts producing
subtly different outputs --- which is exactly why pinning to a specific
model version, and re-running the eval suite before ever moving off a
pin, is not paranoia, it's the same discipline as regression testing in
any other software system. **Distribution shift** is what happens when
the real world drifts away from what the system was built and tested
against --- new slang, a new product line, a competitor's name the
model has never seen paired with the domain it's being asked about ---
and the fix is never "hope the model generalizes," it's the same
retrieval and memory machinery from Part Two's Stage 3, kept
continuously current rather than frozen at whatever the data looked
like on launch day.

Cost and latency are not afterthoughts either, and I've made this
mistake myself: reaching for the most powerful, most expensive model
for every single call in a pipeline, when half those calls are simple
classification steps a far smaller and cheaper model handles just as
reliably. The honest engineering question, on every call in a system, is
the same one I apply to picking a tool in the first place --- what's
the cheapest, fastest component that reliably clears the bar this
specific step actually needs, not the bar the flashiest model could
clear if I threw it at everything.

**VIII½**

**Open Weights, Closed Weights, and Running a Model on My Own
Machine**

**One** more decision I had to actually learn to make rather than
default on: whether a project needs a hosted, closed-weight frontier
model reached through an API, or an open-weight model I download and
run myself. Closed models --- the frontier systems from the major labs
--- are usually the strongest available at any given moment on genuinely
hard, multi-step reasoning, and I never have to think about
infrastructure; I pay per token and the provider handles everything
underneath. Open-weight models --- families like Llama, Mistral,
Qwen, and others, whose weights are published for anyone to download
--- trade some of that frontier capability for control: no data leaves
my machine, no per-token bill, and I can fine-tune the weights directly
rather than only steering behavior through a prompt.

Running an open-weight model locally almost always means
**quantization** --- storing the model's weights at lower numerical
precision (8-bit or even 4-bit integers instead of the 16- or
32-bit floating point numbers used during training) to shrink both the
memory footprint and the compute needed to run it, at the cost of a
small, usually tolerable, drop in output quality. A 70-billion-parameter
model that would need well over 140 gigabytes of memory at full
precision can often run respectably on a single high-end consumer GPU
once quantized to 4 bits --- the difference between "needs a data
center" and "runs on my desk," for a real, if slightly blunted, amount
of capability.

I've settled into a rule of thumb that mirrors the one I use for
choosing a model size for any given task: closed, frontier, hosted
models for reasoning-heavy agent work where I want the best available
judgment and I'm not sensitive to sending data off my machine; smaller,
often open, sometimes locally-run and quantized models for narrow,
high-volume, latency- or privacy-sensitive tasks where "good enough,
fast, and mine" beats "best possible, slower, and someone else's."
Neither choice is more legitimate than the other. They're both just
different points on the same tradeoff curve I've been drawing,
knowingly or not, since Part One's very first rung: how much
capability, for how much cost, at how much risk.

**EPILOGUE**

**The Ocean I Fell Into**

**I** didn\'t set out to explain AI to you like a textbook. There are
enough textbooks, and most of them describe the ladder without ever
mentioning that a person actually has to climb it, at 2 a.m., alone,
unsure if the next rung will hold.

What I set out to do was show you what it feels like from the inside.
The ocean I fell into, thinking it was one thing and finding it was a
thousand. The one word --- predict --- running quietly under every rung
of both ladders, the one about models and the one about how we use them.
And the road I\'m walking right now, brick by brick, module by module,
agent by agent, not from a finished blueprint I\'m merely executing, but
genuinely figuring it out as I go --- correcting the plan the same way a
gradient-boosted tree corrects the mistake the tree before it made.

> ***The future isn\'t something that\'s going to happen to us. It\'s
> something we\'re already inside of, building it with our own hands,
> one small piece at a time. Two sides of one coin --- the invention and
> the use --- and both of them, still, right now, being written.***

**ABOUT THE AUTHOR**

Surya writes from the inside of the machines he takes apart. A
self-directed builder and lifelong systems-thinker, he explores the
architecture of artificial intelligence, markets, and mind with the same
instinct: open it up, find the floor under the floor, and write down
what\'s actually there. PREDICT is his field record of that pursuit ---
part confession, part documentary, part invitation to anyone standing at
the base of the same mountain.
